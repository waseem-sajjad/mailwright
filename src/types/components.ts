import type { BaseComponent, ComponentType } from './common';
import type { CanvasProperties } from './properties';

export interface CanvasComponentType extends BaseComponent<CanvasProperties> {
    type: ComponentType;
}
