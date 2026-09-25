import { toPng } from 'html-to-image';

/**
 * Captures the canvas as a PNG data URL for library thumbnails. Returns null
 * when capture fails (cross-origin images, unsupported browser) so saving
 * never blocks on a screenshot.
 */
export const captureCanvas = async (): Promise<string | null> => {
    const element = document.querySelector<HTMLElement>('[data-canvas-root]');
    if (!element) return null;
    try {
        return await toPng(element, {
            pixelRatio: 0.6,
            cacheBust: true,
            backgroundColor: '#ffffff',
            filter: (node) => {
                // Skip editor chrome: toolbars, badges and drop slots.
                if (!(node instanceof HTMLElement)) return true;
                return !node.dataset.editorOnly;
            },
        });
    } catch {
        return null;
    }
};
