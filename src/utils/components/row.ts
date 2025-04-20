import { nanoid } from 'nanoid';

import type {
    CanvasComponentType,
    ColumnComponentType,
    ComponentType,
    RowComponentType,
    RowProperties,
} from '@/types';
import { emailStore } from '@/hooks';

export class RowComponent implements RowComponentType {
    id: string = nanoid(8);

    type: ComponentType = 'Row';

    name: string = 'row';

    parent: CanvasComponentType | null = null;

    children: ColumnComponentType[] = [];

    properties: RowProperties = {
        backgroundColor: {
            r: 255,
            g: 255,
            b: 255,
            a: 0,
        },
        contentAlign: 'center',
        paddingLink: true,
        paddingBottom: 0,
        paddingRight: 0,
        paddingLeft: 0,
        paddingTop: 0,
        stack: true,
    };

    addChild(child: ColumnComponentType) {
        child.parent = this;
        this.children.push(child);
        emailStore.notification();
    }

    removeChild(child: ColumnComponentType) {
        child.parent = null;
        this.children = this.children.filter((c) => c.id !== child.id);
        emailStore.notification();
    }
}
