import { create } from 'zustand';

import type { ViewMode } from '@/types';

export type Dialog = 'none' | 'preview' | 'export' | 'templates' | 'ai';

export interface ToastMessage {
    message: string;
    tone: 'success' | 'info';
    /** Changes on every call so identical messages still re-trigger. */
    key: number;
}

interface Settings {
    view: ViewMode;
    hover: string;
    dialog: Dialog;
    dragging: boolean;
    sidebarTab: 'blocks' | 'layers';
    toast: ToastMessage | null;
    /** Render device-hidden blocks dimmed instead of collapsing them. */
    showHidden: boolean;

    setView: (view: ViewMode) => void;
    setHover: (hover: string) => void;
    setDialog: (dialog: Dialog) => void;
    setDragging: (dragging: boolean) => void;
    setSidebarTab: (tab: 'blocks' | 'layers') => void;
    notify: (message: string, tone?: ToastMessage['tone']) => void;
    clearToast: () => void;
    setShowHidden: (showHidden: boolean) => void;
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
    toast: null,
    showHidden: true,
    setHover: (hover) => set({ hover }),
    setView: (view) => set({ view }),
    setDialog: (dialog) => set({ dialog }),
    setDragging: (dragging) => set({ dragging }),
    setSidebarTab: (sidebarTab) => set({ sidebarTab }),
    notify: (message, tone = 'success') =>
        set({ toast: { message, tone, key: Date.now() } }),
    clearToast: () => set({ toast: null }),
    setShowHidden: (showHidden) => set({ showHidden }),
}));
