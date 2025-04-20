import { create } from 'zustand';

import { CanvasComponent } from '@/utils/components';
import type { BaseComponent } from '@/types';

interface EmailState {
    components: BaseComponent<any>[];
    active: BaseComponent<any>;

    updateActiveProperties: <T>(properties: Partial<T>) => void;
    setComponents: (components: BaseComponent<any>[]) => void;
    setActive: <T>(component: BaseComponent<T>) => void;
    notification: () => void;
}

export const useEmail = create<EmailState>((set) => {
    const canvasComponent = new CanvasComponent();
    return {
        components: [canvasComponent],
        active: canvasComponent,
        setComponents(components) {
            set((state) => ({
                components: [...state.components, ...components],
            }));
        },
        setActive(component) {
            set((state) => {
                if (component.id !== state.active.id) {
                    state.active = component;
                    return {
                        active: component,
                    };
                }

                return state;
            });
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
        notification: () => {
            set((state) => ({
                active: state.active,
            }));
        },
    };
});

export const emailStore = useEmail.getState();
