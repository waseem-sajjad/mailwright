import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { SCREENSHOT_DIR } from './db.ts';

/** Stores a `data:image/png;base64,…` screenshot; returns its public path. */
export const saveScreenshot = (id: string, dataUrl: string | null | undefined): string | null => {
    if (!dataUrl) return null;
    const match = dataUrl.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);
    if (!match) return null;
    const file = path.join(SCREENSHOT_DIR, `${id}.${match[1] === 'jpeg' ? 'jpg' : match[1]}`);
    writeFileSync(file, Buffer.from(match[2], 'base64'));
    return `/api/templates/${id}/screenshot`;
};

export const screenshotFile = (id: string): string | null => {
    for (const ext of ['png', 'jpg', 'webp']) {
        const file = path.join(SCREENSHOT_DIR, `${id}.${ext}`);
        if (existsSync(file)) return file;
    }
    return null;
};

export const removeScreenshot = (id: string): void => {
    const file = screenshotFile(id);
    if (file) {
        try {
            unlinkSync(file);
        } catch {
            // already gone
        }
    }
};
