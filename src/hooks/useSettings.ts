import { create } from 'zustand';

interface Settings {
    view: 'desktop' | 'tablet' | 'mobile';

    setView: (view: 'desktop' | 'tablet' | 'mobile') => void;
}

export const useSettings = create<Settings>((set) => ({
    view: 'desktop',
    setView: (view) => set({ view }),
}));
