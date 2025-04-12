import { create } from 'zustand';

import type { ComponentType } from '@/types';

interface Settings {
    view: 'desktop' | 'tablet' | 'mobile';
    active?: ComponentType<any>;
    component: string;

    setView: (view: 'desktop' | 'tablet' | 'mobile') => void;
    setComponent: <T>(component: string, element?: ComponentType<T>) => void;
}

export const useSettings = create<Settings>((set) => ({
    view: 'desktop',
    active: undefined,
    component: 'Canvas',

    setView: (view) => set({ view }),
    setComponent(component, element) {
        set({ component, active: element });
    },
}));
