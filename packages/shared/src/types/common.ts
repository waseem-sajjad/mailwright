
/** Same shape as react-color's RGBColor, defined here so the package has no UI dependency. */
export interface RGBColor {
    r: number;
    g: number;
    b: number;
    a?: number;
}

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
    | 'Menu'
    | 'Spacer'
    | 'Table'
    | 'Icons'
    | 'Product'
    | 'Quote'
    | 'Coupon'
    | 'Callout'
    | 'Footer';

/** Types that live inside a Column. */
export type ContentType = Exclude<ComponentType, 'Canvas' | 'Row' | 'Column'>;

/** The plain, serialisable node that every block in the tree is made of. */
export interface EmailNode<T = any> {
    id: string;
    type: ComponentType;
    properties: T;
    children: EmailNode[];
}

export type Align = 'left' | 'center' | 'right';

export type Border = {
    style: 'none' | 'solid' | 'dashed' | 'dotted';
    color: RGBColor;
    width: number;
    radius: number;
};

export type Padding = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

/** What kind of thing a droppable slot accepts. */
export type DropKind = 'row' | 'column' | 'content';

export type DragCardData = {
    type: 'card';
    name: ComponentType;
    kind: DropKind;
};

export type DragBlockData = {
    type: 'block';
    id: string;
    kind: DropKind;
};

export type DragData = DragCardData | DragBlockData;

export type SlotData = {
    kind: DropKind;
    parentId: string;
    index: number;
};
