import type { RGBColor } from 'react-color';

export type CanvasType = {
    backgroundColor: RGBColor;
    fontFamily: React.CSSProperties['fontFamily'];
    fontWeight: string;
    color: RGBColor;
    preheaderText: string;
    contentWidth: number;
};
