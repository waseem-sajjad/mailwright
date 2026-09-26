import { randomBytes } from 'node:crypto';

/** Short URL-safe ids ([A-Za-z0-9_-], 11 chars). */
export const newId = (): string => randomBytes(8).toString('base64url');

export const decodeDataUrl = (dataUrl: string): { bytes: Buffer; type: string } | null => {
    const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
    return match ? { bytes: Buffer.from(match[2], 'base64'), type: match[1] } : null;
};
