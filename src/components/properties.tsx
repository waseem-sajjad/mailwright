import { CanvasProperty } from '@/components/property';
import type { BaseComponent } from '@/types';

type Property = Record<
    string,
    { name: string; element: React.FC<BaseComponent<any>> }
>;

export const properties: Property = {
    canvas: {
        name: 'General Settings',
        element: CanvasProperty,
    },
    row: {
        name: 'Row Settings',
        element: () => null,
    },
};
