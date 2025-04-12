import { CanvasProperty } from '@/components/property';

type Property = Record<string, { name: string; element: React.ReactNode }>;

export const properties: Property = {
    Canvas: {
        name: 'General Settings',
        element: <CanvasProperty />,
    },
    Row: {
        name: 'Row Settings',
        element: <div>Row Settings</div>,
    },
};
