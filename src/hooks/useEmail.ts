import { create } from 'zustand';

import type { BaseComponent } from '@/types';
import { CanvasComponent } from '@/utils';

interface EmailState {
    components: BaseComponent<any>[];
    active?: BaseComponent<any>;

    updateActiveProperties: <T>(properties: Partial<T>) => void;
    setComponents: (components: BaseComponent<any>[]) => void;
    setActive: <T>(component: BaseComponent<T>) => void;
}

const canvasComponent = new CanvasComponent();

export const useEmail = create<EmailState>((set) => ({
    components: [canvasComponent],
    active: canvasComponent,
    setComponents(components) {
        set((state) => ({
            components: [...state.components, ...components],
        }));
    },
    setActive(component) {
        set((state) => ({
            active:
                state.active?.name === component.name
                    ? state.active
                    : component,
        }));
    },
    updateActiveProperties: <T>(properties: Partial<T>) => {
        set((state) => {
            if (state.active) {
                state.active.properties = {
                    ...state.active.properties,
                    ...properties,
                };

                return {
                    active: state.active,
                };
            }
            return state;
        });
    },
}));
