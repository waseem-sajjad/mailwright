import type { RGBColor } from 'react-color';

export type ComponentType =
    | 'Canvas'
    | 'Row'
    | 'Column'
    | 'Heading'
    | 'Text'
    | 'Divider'
    | 'Button'
    | 'List'
    | 'Image'
    | 'Video'
    | 'Social'
    | 'HTML'
    | 'Menu';

export interface BaseComponent<T> {
    id: string;
    type: ComponentType;
    name: string;
    parent: BaseComponent<any> | null;
    children: BaseComponent<any>[];
    properties: T;

    addChild: (child: BaseComponent<any>) => void;
    removeChild: (child: BaseComponent<any>) => void;
}

export type Border = {
    style: 'solid' | 'dashed' | 'dotted';
    color: RGBColor;
    width: number;
};
