import { nanoid } from 'nanoid';

import type {
    BaseComponent,
    CanvasComponentType,
    CanvasProperties,
    ComponentType,
} from '@/types';

export class CanvasComponent implements CanvasComponentType {
    id: string = nanoid(8);

    type: ComponentType = 'Canvas';

    name: string = 'canvas';

    parent: BaseComponent<CanvasProperties> | null = null;

    children: BaseComponent<CanvasProperties>[] = [];

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

    addChild(child: BaseComponent<CanvasProperties>) {
        child.parent = this;
        this.children.push(child);
    }

    removeChild(child: BaseComponent<CanvasProperties>) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            child.parent = null;
            this.children.splice(index, 1);
        }
    }
}
