import type { EmailNode } from './common';
import type {
    ButtonProperties,
    CanvasProperties,
    ColumnProperties,
    DividerProperties,
    HeadingProperties,
    HtmlProperties,
    ImageProperties,
    ListProperties,
    MenuProperties,
    RowProperties,
    SocialProperties,
    SpacerProperties,
    TextProperties,
    VideoProperties,
} from './properties';

export type CanvasNode = EmailNode<CanvasProperties>;
export type RowNode = EmailNode<RowProperties>;
export type ColumnNode = EmailNode<ColumnProperties>;
export type HeadingNode = EmailNode<HeadingProperties>;
export type TextNode = EmailNode<TextProperties>;
export type DividerNode = EmailNode<DividerProperties>;
export type ButtonNode = EmailNode<ButtonProperties>;
export type ListNode = EmailNode<ListProperties>;
export type ImageNode = EmailNode<ImageProperties>;
export type VideoNode = EmailNode<VideoProperties>;
export type SocialNode = EmailNode<SocialProperties>;
export type HtmlNode = EmailNode<HtmlProperties>;
export type MenuNode = EmailNode<MenuProperties>;
export type SpacerNode = EmailNode<SpacerProperties>;

/** A saved template document. */
export interface EmailDocument {
    version: 1;
    name: string;
    updatedAt: string;
    root: CanvasNode;
}
