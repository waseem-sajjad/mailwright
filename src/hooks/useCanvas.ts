import { create } from 'zustand';

import type { CanvasType } from '@/types';

interface CanvasState {
    styles: CanvasType;
    setStyles: (styles: Partial<CanvasType>) => void;
}

export const useCanvas = create<CanvasState>((set) => ({
    styles: {
        backgroundColor: {
            r: 242,
            g: 242,
            b: 242,
        },
        fontWeight: 'normal',
        fontFamily: 'Arial',
        contentWidth: 600,
        preheaderText: '',
        color: {
            r: 0,
            g: 0,
            b: 0,
        },
    },
    setStyles(styles) {
        set((state) => ({
            styles: {
                ...state.styles,
                ...styles,
            },
        }));
    },
}));
