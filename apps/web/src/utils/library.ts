import type { CanvasNode } from '@/types';

import { normalizeNode } from './factory';
import { newId } from './tree';

export const LIBRARY_KEY = 'email-template-builder:library';

export interface SavedTemplate {
    id: string;
    name: string;
    updatedAt: string;
    root: CanvasNode;
}

export const loadLibrary = (): SavedTemplate[] => {
    try {
        const raw = localStorage.getItem(LIBRARY_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as SavedTemplate[];
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((t) => t?.root?.type === 'Canvas')
            .map((t) => ({ ...t, root: normalizeNode(t.root) as CanvasNode }));
    } catch {
        return [];
    }
};

const write = (items: SavedTemplate[]): SavedTemplate[] => {
    try {
        localStorage.setItem(LIBRARY_KEY, JSON.stringify(items));
    } catch {
        // Quota exceeded or storage unavailable; keep the in-memory list.
    }
    return items;
};

export const saveToLibrary = (
    name: string,
    root: CanvasNode,
    id?: string,
): SavedTemplate[] => {
    const items = loadLibrary();
    const entry: SavedTemplate = {
        id: id ?? newId(),
        name: name.trim() || 'Untitled template',
        updatedAt: new Date().toISOString(),
        root,
    };
    const index = items.findIndex((t) => t.id === entry.id);
    if (index === -1) items.unshift(entry);
    else items[index] = entry;
    return write(items);
};

export const removeFromLibrary = (id: string): SavedTemplate[] =>
    write(loadLibrary().filter((t) => t.id !== id));

export const renameInLibrary = (id: string, name: string): SavedTemplate[] =>
    write(
        loadLibrary().map((t) =>
            t.id === id ? { ...t, name: name.trim() || t.name } : t,
        ),
    );
