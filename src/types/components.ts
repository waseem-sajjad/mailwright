import type {
    CanvasProperties,
    ColumnProperties,
    RowProperties,
} from './properties';
import type { BaseComponent, ComponentType } from './common';

export interface CanvasComponentType extends BaseComponent<CanvasProperties> {
    children: BaseComponent<RowProperties>[];
    type: ComponentType;
}

export interface ColumnComponentType extends BaseComponent<ColumnProperties> {
    parent: BaseComponent<RowProperties> | null;
    type: ComponentType;
}

export interface RowComponentType extends BaseComponent<RowProperties> {
    children: BaseComponent<ColumnProperties>[];
    parent: BaseComponent<CanvasProperties> | null;
    type: ComponentType;
}
