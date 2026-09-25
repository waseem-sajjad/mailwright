import { create } from 'zustand';

import type {
    CanvasNode,
    ColumnLayout,
    ComponentType,
    EmailNode,
    RowNode,
} from '@/types';
import {
    applyLayout,
    cloneNode,
    createCanvas,
    createNode,
    debounce,
    duplicateNode as duplicateInTree,
    findNode,
    findParent,
    insertNode,
    loadDocument,
    mapNode,
    moveNode as moveInTree,
    removeNode as removeFromTree,
    saveDocument,
    updateProperties as updateInTree,
} from '@/utils';

const HISTORY_LIMIT = 100;

const findPathIds = (root: CanvasNode, id: string): string[] => {
    const walk = (node: EmailNode, trail: string[]): string[] | null => {
        const next = [...trail, node.id];
        if (node.id === id) return next;
        for (const child of node.children) {
            const found = walk(child, next);
            if (found) return found;
        }
        return null;
    };
    return walk(root, []) ?? [];
};

interface EmailState {
    root: CanvasNode;
    name: string;
    activeId: string;
    past: CanvasNode[];
    future: CanvasNode[];
    /** True while a run of transient (keystroke-level) edits is in progress. */
    transient: boolean;
    savedAt: string | null;

    setName: (name: string) => void;
    setActive: (id: string | null) => void;
    updateProperties: <T>(
        id: string,
        properties: Partial<T>,
        options?: { transient?: boolean },
    ) => void;
    updateActiveProperties: <T>(
        properties: Partial<T>,
        options?: { transient?: boolean },
    ) => void;
    commit: () => void;
    addNode: (type: ComponentType, parentId: string, index?: number) => void;
    insertNode: (node: EmailNode, parentId: string, index?: number) => void;
    moveNode: (id: string, parentId: string, index: number) => void;
    removeNode: (id: string) => void;
    duplicateNode: (id: string) => void;
    setRowLayout: (rowId: string, layout: ColumnLayout) => void;
    addColumn: (rowId: string) => void;
    undo: () => void;
    redo: () => void;
    load: (root: CanvasNode, name?: string) => void;
    reset: () => void;

    /** Block copied with Ctrl+C; kept in memory only. */
    clipboard: EmailNode | null;
    copyNode: (id: string) => void;
    pasteNode: () => void;
    reorderColumn: (rowId: string, from: number, to: number) => void;
    /** Id of a freshly added text block that should grab focus. */
    pendingFocus: string | null;
    clearPendingFocus: () => void;
    selectSibling: (direction: -1 | 1) => void;
    selectParent: () => void;
    selectChild: () => void;
}

type Setter = (
    partial: Partial<EmailState> | ((state: EmailState) => Partial<EmailState>),
) => void;

/** Applies a tree transform, recording history unless the edit is transient. */
const apply =
    (set: Setter) =>
    (
        fn: (root: CanvasNode, state: EmailState) => CanvasNode,
        options: { transient?: boolean } = {},
    ) => {
        set((state) => {
            const next = fn(state.root, state);
            if (next === state.root) return state;

            const isTransient = options.transient === true;
            const shouldRecord = !isTransient || !state.transient;
            const past = shouldRecord
                ? [...state.past, state.root].slice(-HISTORY_LIMIT)
                : state.past;

            return {
                root: next,
                past,
                future: shouldRecord ? [] : state.future,
                transient: isTransient,
            };
        });
    };

export const useEmail = create<EmailState>((set, get) => {
    const saved = loadDocument();
    const run = apply(set);

    return {
        root: saved?.root ?? createCanvas(),
        name: saved?.name ?? 'Untitled email',
        activeId: saved?.root.id ?? '',
        past: [],
        future: [],
        transient: false,
        savedAt: saved?.updatedAt ?? null,
        clipboard: null,
        pendingFocus: null,

        setName: (name) => set({ name }),

        setActive: (id) =>
            set((state) => ({
                activeId: id ?? state.root.id,
                transient: false,
            })),

        updateProperties: (id, properties, options) =>
            run(
                (root) => updateInTree(root, id, properties) as CanvasNode,
                options,
            ),

        updateActiveProperties: (properties, options) => {
            const { activeId } = get();
            get().updateProperties(activeId, properties, options);
        },

        commit: () => set({ transient: false }),

        addNode: (type, parentId, index) => {
            const node = createNode(type);
            run(
                (root) => insertNode(root, parentId, node, index) as CanvasNode,
            );
            set({
                activeId: node.id,
                pendingFocus:
                    type === 'Heading' || type === 'Text' ? node.id : null,
            });
        },

        clearPendingFocus: () => set({ pendingFocus: null }),

        copyNode: (id) => {
            const node = findNode(get().root, id);
            if (!node || node.type === 'Canvas' || node.type === 'Column')
                return;
            set({ clipboard: cloneNode(node) });
        },

        pasteNode: () => {
            const { clipboard, root, activeId } = get();
            if (!clipboard) return;
            const active = findNode(root, activeId) ?? root;
            const copy = cloneNode(clipboard);
            let target: { parentId: string; index?: number } | null = null;

            if (copy.type === 'Row') {
                // Paste after the row that contains the selection.
                const path = findPathIds(root, active.id);
                const rowId = path.find(
                    (id) => findNode(root, id)?.type === 'Row',
                );
                if (rowId) {
                    const location = findParent(root, rowId);
                    target = location
                        ? { parentId: root.id, index: location.index + 1 }
                        : null;
                } else {
                    target = { parentId: root.id };
                }
            } else if (active.type === 'Column') {
                target = { parentId: active.id };
            } else if (active.type === 'Row' && active.children[0]) {
                target = { parentId: active.children[0].id };
            } else if (active.type === 'Canvas') {
                const column = root.children[0]?.children[0];
                target = column ? { parentId: column.id } : null;
            } else {
                const location = findParent(root, active.id);
                target = location
                    ? {
                          parentId: location.parent.id,
                          index: location.index + 1,
                      }
                    : null;
            }

            if (!target) return;
            get().insertNode(copy, target.parentId, target.index);
        },

        reorderColumn: (rowId, from, to) =>
            run(
                (root) =>
                    mapNode(root, rowId, (row) => {
                        const children = [...row.children];
                        const layout = [...(row as RowNode).properties.layout];
                        if (
                            from < 0 ||
                            to < 0 ||
                            from >= children.length ||
                            to >= children.length
                        ) {
                            return row;
                        }
                        const [child] = children.splice(from, 1);
                        children.splice(to, 0, child);
                        const [width] = layout.splice(from, 1);
                        layout.splice(to, 0, width);
                        return {
                            ...row,
                            properties: { ...row.properties, layout },
                            children,
                        };
                    }) as CanvasNode,
            ),

        selectSibling: (direction) => {
            const { root, activeId } = get();
            const location = findParent(root, activeId);
            if (!location) return;
            const sibling =
                location.parent.children[location.index + direction];
            if (sibling) set({ activeId: sibling.id });
        },

        selectParent: () => {
            const { root, activeId } = get();
            const location = findParent(root, activeId);
            if (location) set({ activeId: location.parent.id });
        },

        selectChild: () => {
            const { root, activeId } = get();
            const node = findNode(root, activeId);
            if (node?.children[0]) set({ activeId: node.children[0].id });
        },

        insertNode: (node, parentId, index) => {
            run(
                (root) => insertNode(root, parentId, node, index) as CanvasNode,
            );
            set({ activeId: node.id });
        },

        moveNode: (id, parentId, index) => {
            run((root) => moveInTree(root, id, parentId, index) as CanvasNode);
            set({ activeId: id });
        },

        removeNode: (id) => {
            const { root } = get();
            const location = findParent(root, id);
            run((r) => removeFromTree(r, id) as CanvasNode);
            set({ activeId: location ? location.parent.id : root.id });
        },

        duplicateNode: (id) => {
            let createdId = id;
            run((root) => {
                const next = duplicateInTree(root, id) as CanvasNode;
                const location = findParent(next, id);
                if (location) {
                    const copy = location.parent.children[location.index + 1];
                    if (copy) createdId = copy.id;
                }
                return next;
            });
            set({ activeId: createdId });
        },

        setRowLayout: (rowId, layout) =>
            run(
                (root) =>
                    mapNode(root, rowId, (row) =>
                        applyLayout(row as RowNode, layout),
                    ) as CanvasNode,
            ),

        addColumn: (rowId) => {
            const row = findNode(get().root, rowId) as RowNode | null;
            if (!row || row.children.length >= 6) return;
            const count = row.children.length + 1;
            const share = Math.round((100 / count) * 100) / 100;
            const layout = Array.from({ length: count }, () => share);
            get().setRowLayout(rowId, layout);
        },

        undo: () =>
            set((state) => {
                if (state.past.length === 0) return state;
                const previous = state.past[state.past.length - 1];
                return {
                    root: previous,
                    past: state.past.slice(0, -1),
                    future: [state.root, ...state.future].slice(
                        0,
                        HISTORY_LIMIT,
                    ),
                    transient: false,
                    activeId: findNode(previous, state.activeId)
                        ? state.activeId
                        : previous.id,
                };
            }),

        redo: () =>
            set((state) => {
                if (state.future.length === 0) return state;
                const [next, ...rest] = state.future;
                return {
                    root: next,
                    past: [...state.past, state.root].slice(-HISTORY_LIMIT),
                    future: rest,
                    transient: false,
                    activeId: findNode(next, state.activeId)
                        ? state.activeId
                        : next.id,
                };
            }),

        load: (root, name) =>
            set((state) => ({
                root,
                name: name ?? state.name,
                activeId: root.id,
                past: [...state.past, state.root].slice(-HISTORY_LIMIT),
                future: [],
                transient: false,
            })),

        reset: () => {
            const root = createCanvas();
            set((state) => ({
                root,
                name: 'Untitled email',
                activeId: root.id,
                past: [...state.past, state.root].slice(-HISTORY_LIMIT),
                future: [],
                transient: false,
            }));
        },
    };
});

/** Autosave to localStorage, debounced so typing doesn't thrash storage. */
const persist = debounce((root: CanvasNode, name: string) => {
    saveDocument(root, name);
    useEmail.setState({ savedAt: new Date().toISOString() });
}, 600);

useEmail.subscribe((state, previous) => {
    if (state.root !== previous.root || state.name !== previous.name) {
        persist(state.root, state.name);
    }
});

/** Convenience selector: the currently selected node (falls back to root). */
export const useActiveNode = (): EmailNode =>
    useEmail((state) => findNode(state.root, state.activeId) ?? state.root);
