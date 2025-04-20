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
    parent: BaseComponent<T> | null;
    children: BaseComponent<T>[];
    properties: T;

    addChild: (child: BaseComponent<T>) => void;
    removeChild: (child: BaseComponent<T>) => void;
    updateProperties: (properties: Partial<T>) => void;
}
