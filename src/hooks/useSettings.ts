import { create } from 'zustand';

interface Settings {
    view: 'desktop' | 'tablet' | 'mobile';
    hover: string;

    setView: (view: 'desktop' | 'tablet' | 'mobile') => void;
    setHover: (hover: string) => void;
}

export const useSettings = create<Settings>((set) => ({
    view: 'desktop',
    hover: '',
    setHover: (hover) => set({ hover }),
    setView: (view) => set({ view }),
}));
