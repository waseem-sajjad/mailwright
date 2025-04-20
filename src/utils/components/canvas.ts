import { nanoid } from 'nanoid';

import type {
    CanvasComponentType,
    CanvasProperties,
    ComponentType,
    RowComponentType,
} from '@/types';
import { emailStore } from '@/hooks';

export class CanvasComponent implements CanvasComponentType {
    id: string = nanoid(8);

    type: ComponentType = 'Canvas';

    name: string = 'canvas';

    parent: null = null;

    children: RowComponentType[] = [];

    properties: CanvasProperties = {
        backgroundColor: {
            r: 242,
            g: 242,
            b: 242,
        },
        fontWeight: 'normal',
        fontFamily: 'Arial',
        contentWidth: 600,
        preheaderText: '',
        color: {
            r: 0,
            g: 0,
            b: 0,
        },
    };

    addChild(child: RowComponentType) {
        child.parent = this;
        this.children.push(child);
        emailStore.notification();
    }

    removeChild(child: RowComponentType) {
        child.parent = null;
        this.children = this.children.filter((c) => c.id !== child.id);
        emailStore.notification();
    }
}
