import { create } from 'zustand';

import type { BaseComponent } from '@/types';
import { CanvasComponent } from '@/utils';

interface EmailState {
    components: BaseComponent<any>[];
    setComponents: (components: BaseComponent<any>[]) => void;
}

export const useEmail = create<EmailState>((set) => ({
    components: [new CanvasComponent()],
    setComponents(components) {
        set((state) => ({
            components: [...state.components, ...components],
        }));
    },
}));
