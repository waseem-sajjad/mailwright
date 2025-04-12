import type { RGBColor } from 'react-color';

import type { BorderType } from '@/types';

export const contentAlign = (align: string): string => {
    if (align === 'left') return '0';
    if (align === 'right') return '0 0 0 auto';
    return '0 auto';
};

export const borderStyle = (border?: BorderType): string => {
    if (!border) return 'none';
    return `${border.width}px ${border.style} ${border.color}`;
};

export const rgbaToHex = (color: RGBColor): string => {
    const toHex = (val: number): string => {
        const result = Math.max(0, Math.min(255, Math.round(val)))
            .toString(16)
            .padStart(2, '0');

        return result;
    };
    const hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;

    return color.a !== undefined ? `${hex}${toHex(color.a * 255)}` : hex;
};
