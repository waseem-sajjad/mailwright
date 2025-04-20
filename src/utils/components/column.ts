import { nanoid } from 'nanoid';

import type {
    BaseComponent,
    ColumnComponentType,
    ColumnProperties,
    ComponentType,
    RowProperties,
} from '@/types';
import { emailStore } from '@/hooks';

export class ColumnComponent implements ColumnComponentType {
    id: string = nanoid(8);

    type: ComponentType = 'Column';

    name: string = 'column';

    parent: BaseComponent<RowProperties> | null = null;

    children: BaseComponent<any>[] = [];

    properties: ColumnProperties = {
        backgroundColor: {
            r: 255,
            g: 255,
            b: 255,
            a: 0,
        },
        paddingBottom: 0,
        paddingRight: 0,
        paddingLeft: 0,
        paddingTop: 0,
        width: '100%',
    };

    addChild(child: BaseComponent<any>) {
        child.parent = this;
        this.children.push(child);
        emailStore.notification();
    }

    removeChild(child: BaseComponent<any>) {
        child.parent = null;
        this.children = this.children.filter((c) => c.id !== child.id);
        emailStore.notification();
    }
}
