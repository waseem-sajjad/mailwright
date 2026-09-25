import type { EmailNode } from './common';
import type {
    ButtonProperties,
    CalloutProperties,
    CanvasProperties,
    ColumnProperties,
    CouponProperties,
    DividerProperties,
    FooterProperties,
    HeadingProperties,
    HtmlProperties,
    IconsProperties,
    ImageProperties,
    ListProperties,
    MenuProperties,
    ProductProperties,
    QuoteProperties,
    RowProperties,
    SocialProperties,
    SpacerProperties,
    TableProperties,
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
export type TableNode = EmailNode<TableProperties>;
export type IconsNode = EmailNode<IconsProperties>;
export type ProductNode = EmailNode<ProductProperties>;
export type QuoteNode = EmailNode<QuoteProperties>;
export type CouponNode = EmailNode<CouponProperties>;
export type CalloutNode = EmailNode<CalloutProperties>;
export type FooterNode = EmailNode<FooterProperties>;

/** A saved template document. */
export interface EmailDocument {
    version: 1;
    name: string;
    updatedAt: string;
    root: CanvasNode;
}
