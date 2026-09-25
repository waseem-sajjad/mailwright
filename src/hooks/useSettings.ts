import { create } from 'zustand';

import type { ViewMode } from '@/types';

export type Dialog = 'none' | 'preview' | 'export' | 'templates';

interface Settings {
    view: ViewMode;
    hover: string;
    dialog: Dialog;
    dragging: boolean;
    sidebarTab: 'blocks' | 'layers';

    setView: (view: ViewMode) => void;
    setHover: (hover: string) => void;
    setDialog: (dialog: Dialog) => void;
    setDragging: (dragging: boolean) => void;
    setSidebarTab: (tab: 'blocks' | 'layers') => void;
}

export const VIEW_WIDTH: Record<ViewMode, string> = {
    desktop: '100%',
    tablet: '640px',
    mobile: '375px',
};

export const useSettings = create<Settings>((set) => ({
    view: 'desktop',
    hover: '',
    dialog: 'none',
    dragging: false,
    sidebarTab: 'blocks',
    setHover: (hover) => set({ hover }),
    setView: (view) => set({ view }),
    setDialog: (dialog) => set({ dialog }),
    setDragging: (dragging) => set({ dragging }),
    setSidebarTab: (sidebarTab) => set({ sidebarTab }),
}));
