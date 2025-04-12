import type { RGBColor } from 'react-color';

export type BorderType = {
    style: React.CSSProperties['borderStyle'];
    width: React.CSSProperties['borderWidth'];
    color: RGBColor;
};

export type ComponentType<T> = {
    id: string;
    styles: T;
};
