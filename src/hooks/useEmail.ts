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
            set({ activeId: node.id });
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
