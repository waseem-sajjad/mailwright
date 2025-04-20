import { create } from 'zustand';

import type { BaseComponent } from '@/types';

interface Settings {
    view: 'desktop' | 'tablet' | 'mobile';
    active?: BaseComponent<any>;

    setView: (view: 'desktop' | 'tablet' | 'mobile') => void;
    setActive: <T>(component: BaseComponent<T>) => void;
}

export const useSettings = create<Settings>((set) => ({
    view: 'desktop',
    active: undefined,
    setView: (view) => set({ view }),
    setActive(component) {
        set((state) => ({
            active:
                state.active?.name === component.name
                    ? state.active
                    : component,
        }));
    },
}));
