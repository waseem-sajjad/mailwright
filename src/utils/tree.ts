import { nanoid } from 'nanoid';

import type { EmailNode } from '@/types';

export const newId = (): string => nanoid(8);

export const findNode = (root: EmailNode, id: string): EmailNode | null => {
    if (root.id === id) return root;
    for (const child of root.children) {
        const found = findNode(child, id);
        if (found) return found;
    }
    return null;
};

export const findParent = (
    root: EmailNode,
    id: string,
): { parent: EmailNode; index: number } | null => {
    const index = root.children.findIndex((c) => c.id === id);
    if (index !== -1) return { parent: root, index };
    for (const child of root.children) {
        const found = findParent(child, id);
        if (found) return found;
    }
    return null;
};

/** Path from the root down to the node, root first. */
export const findPath = (root: EmailNode, id: string): EmailNode[] => {
    if (root.id === id) return [root];
    for (const child of root.children) {
        const path = findPath(child, id);
        if (path.length > 0) return [root, ...path];
    }
    return [];
};

export const isDescendant = (
    root: EmailNode,
    ancestorId: string,
    id: string,
): boolean => {
    const ancestor = findNode(root, ancestorId);
    return ancestor ? findNode(ancestor, id) !== null : false;
};

/** Returns a new tree with `fn` applied to the node with `id`. */
export const mapNode = (
    root: EmailNode,
    id: string,
    fn: (node: EmailNode) => EmailNode,
): EmailNode => {
    if (root.id === id) return fn(root);
    let changed = false;
    const children = root.children.map((child) => {
        const next = mapNode(child, id, fn);
        if (next !== child) changed = true;
        return next;
    });
    return changed ? { ...root, children } : root;
};

export const updateProperties = <T>(
    root: EmailNode,
    id: string,
    properties: Partial<T>,
): EmailNode =>
    mapNode(root, id, (node) => ({
        ...node,
        properties: { ...node.properties, ...properties },
    }));

export const insertNode = (
    root: EmailNode,
    parentId: string,
    node: EmailNode,
    index?: number,
): EmailNode =>
    mapNode(root, parentId, (parent) => {
        const children = [...parent.children];
        const at =
            index === undefined
                ? children.length
                : Math.max(0, Math.min(index, children.length));
        children.splice(at, 0, node);
        return { ...parent, children };
    });

export const removeNode = (root: EmailNode, id: string): EmailNode => {
    const location = findParent(root, id);
    if (!location) return root;
    return mapNode(root, location.parent.id, (parent) => ({
        ...parent,
        children: parent.children.filter((c) => c.id !== id),
    }));
};

export const replaceChildren = (
    root: EmailNode,
    id: string,
    children: EmailNode[],
): EmailNode => mapNode(root, id, (node) => ({ ...node, children }));

/**
 * Moves a node to `parentId` at `index`. The index refers to the position in
 * the target's children *before* the node is removed from its old position.
 */
export const moveNode = (
    root: EmailNode,
    id: string,
    parentId: string,
    index: number,
): EmailNode => {
    const node = findNode(root, id);
    const from = findParent(root, id);
    if (!node || !from) return root;
    if (id === parentId || isDescendant(root, id, parentId)) return root;

    let target = index;
    if (from.parent.id === parentId && from.index < index) target -= 1;

    const without = removeNode(root, id);
    return insertNode(without, parentId, node, target);
};

export const cloneNode = (node: EmailNode): EmailNode => ({
    ...node,
    id: newId(),
    properties: JSON.parse(JSON.stringify(node.properties)),
    children: node.children.map(cloneNode),
});

export const duplicateNode = (root: EmailNode, id: string): EmailNode => {
    const node = findNode(root, id);
    const location = findParent(root, id);
    if (!node || !location) return root;
    return insertNode(
        root,
        location.parent.id,
        cloneNode(node),
        location.index + 1,
    );
};

export const countNodes = (root: EmailNode): number =>
    1 + root.children.reduce((sum, child) => sum + countNodes(child), 0);

/** Returns the id of the node sitting at the same level next to `id`. */
export const siblingId = (
    root: EmailNode,
    id: string,
    direction: -1 | 1,
): string | null => {
    const location = findParent(root, id);
    if (!location) return null;
    const sibling = location.parent.children[location.index + direction];
    return sibling ? sibling.id : null;
};
