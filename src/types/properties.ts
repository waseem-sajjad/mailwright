import type { RGBColor } from 'react-color';

import type { Border } from './common';

export type CanvasProperties = {
    backgroundColor: RGBColor;
    fontFamily: React.CSSProperties['fontFamily'];
    fontWeight: string;
    color: RGBColor;
    preheaderText: string;
    contentWidth: number;
};

export type RowProperties = {
    backgroundColor: RGBColor;
    paddingBottom: number;
    contentAlign: string;
    paddingLink: boolean;
    paddingRight: number;
    paddingLeft: number;
    paddingTop: number;
    stack: boolean;
};

export type ColumnProperties = {
    borderBottom?: Border;
    borderRight?: Border;
    borderLeft?: Border;
    borderTop?: Border;
    backgroundColor: RGBColor;
    paddingBottom: number;
    paddingRight: number;
    paddingLeft: number;
    paddingTop: number;
    width: string;
};
