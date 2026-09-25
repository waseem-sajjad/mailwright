import type { Align, Border, Padding, RGBColor } from '@/types';

export const contentAlign = (align: Align): string => {
    if (align === 'left') return '0';
    if (align === 'right') return '0 0 0 auto';
    return '0 auto';
};

export const rgbaToHex = (color: RGBColor): string => {
    const toHex = (val: number): string =>
        Math.max(0, Math.min(255, Math.round(val)))
            .toString(16)
            .padStart(2, '0');
    const hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;

    return color.a !== undefined && color.a < 1
        ? `${hex}${toHex(color.a * 255)}`
        : hex;
};

/** CSS colour string safe for both browser preview and email export. */
export const rgbaToCss = (color: RGBColor): string => {
    if (color.a !== undefined && color.a === 0) return 'transparent';
    return rgbaToHex({ ...color, a: undefined });
};

export const isTransparent = (color: RGBColor): boolean =>
    color.a !== undefined && color.a === 0;

export const rgb = (r: number, g: number, b: number, a = 1): RGBColor => ({
    r,
    g,
    b,
    a,
});

export const paddingCss = (padding: Padding): string =>
    `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;

export const uniformPadding = (value: number): Padding => ({
    top: value,
    right: value,
    bottom: value,
    left: value,
});

export const borderCss = (border?: Border): string => {
    if (!border || border.style === 'none' || border.width === 0) return 'none';
    return `${border.width}px ${border.style} ${rgbaToCss(border.color)}`;
};

export const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

export const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

/** Extract a YouTube / Vimeo poster image from a share URL when possible. */
export const videoThumbnail = (url: string): string => {
    const yt = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
    );
    if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return `https://vumbnail.com/${vimeo[1]}.jpg`;
    return '';
};

export const debounce = <T extends (...args: any[]) => void>(
    fn: T,
    wait: number,
): ((...args: Parameters<T>) => void) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return (...args: Parameters<T>) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
    };
};
