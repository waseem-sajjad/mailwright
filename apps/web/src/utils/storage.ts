import { normalizeNode } from '@mailwright/shared/utils';

import type { CanvasNode, EmailDocument } from '@/types';

export const STORAGE_KEY = 'mailwright:document';

export const loadDocument = (): EmailDocument | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as EmailDocument;
        if (parsed?.root?.type !== 'Canvas') return null;
        return { ...parsed, root: normalizeNode(parsed.root) as CanvasNode };
    } catch {
        return null;
    }
};

export const saveDocument = (root: CanvasNode, name: string): void => {
    try {
        const doc: EmailDocument = {
            version: 1,
            name,
            updatedAt: new Date().toISOString(),
            root,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
        // Storage may be unavailable (private mode, quota). Ignore silently.
    }
};

export const clearDocument = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore
    }
};

export const downloadFile = (
    filename: string,
    content: string,
    mime = 'text/plain',
): void => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });

export const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};

export const slugify = (value: string): string =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'email-template';

/** Native confirm kept in one place so callers stay lint-clean. */

export const confirmAction = (message: string): boolean =>
    // eslint-disable-next-line no-alert
    window.confirm(message);
