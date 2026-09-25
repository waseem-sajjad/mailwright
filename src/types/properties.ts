import type { Align, Border, Padding, RGBColor } from './common';

export type CanvasProperties = {
    backgroundColor: RGBColor;
    contentBackgroundColor: RGBColor;
    fontFamily: string;
    color: RGBColor;
    linkColor: RGBColor;
    preheaderText: string;
    contentWidth: number;
    title: string;
};

export type ColumnLayout = number[];

export type RowProperties = {
    backgroundColor: RGBColor;
    contentBackgroundColor: RGBColor;
    backgroundImage: string;
    padding: Padding;
    paddingLink: boolean;
    contentAlign: Align;
    stack: boolean;
    layout: ColumnLayout;
};

export type ColumnProperties = {
    backgroundColor: RGBColor;
    padding: Padding;
    paddingLink: boolean;
    border: Border;
    verticalAlign: 'top' | 'middle' | 'bottom';
    width: number;
};

export type TextLikeProperties = {
    text: string;
    align: Align;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    fontWeight: 'normal' | 'bold';
    fontFamily: string;
    color: RGBColor;
    inheritColor: boolean;
    padding: Padding;
    paddingLink: boolean;
};

export type HeadingProperties = TextLikeProperties & {
    level: 'h1' | 'h2' | 'h3' | 'h4';
};

export type TextProperties = TextLikeProperties;

export type DividerProperties = {
    width: number;
    thickness: number;
    style: 'solid' | 'dashed' | 'dotted';
    color: RGBColor;
    align: Align;
    padding: Padding;
    paddingLink: boolean;
};

export type ButtonProperties = {
    text: string;
    href: string;
    target: '_blank' | '_self';
    align: Align;
    fullWidth: boolean;
    backgroundColor: RGBColor;
    color: RGBColor;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    border: Border;
    innerPadding: Padding;
    innerPaddingLink: boolean;
    padding: Padding;
    paddingLink: boolean;
};

export type ListProperties = {
    items: string[];
    ordered: boolean;
    fontSize: number;
    lineHeight: number;
    color: RGBColor;
    inheritColor: boolean;
    align: Align;
    padding: Padding;
    paddingLink: boolean;
};

export type ImageProperties = {
    src: string;
    alt: string;
    href: string;
    width: number;
    autoWidth: boolean;
    align: Align;
    borderRadius: number;
    padding: Padding;
    paddingLink: boolean;
};

export type VideoProperties = {
    url: string;
    thumbnail: string;
    autoThumbnail: boolean;
    alt: string;
    width: number;
    align: Align;
    playButton: boolean;
    padding: Padding;
    paddingLink: boolean;
};

export type SocialNetwork =
    | 'facebook'
    | 'instagram'
    | 'x'
    | 'linkedin'
    | 'youtube'
    | 'tiktok'
    | 'pinterest'
    | 'website'
    | 'email';

export type SocialItem = {
    id: string;
    network: SocialNetwork;
    href: string;
    iconUrl: string;
};

export type SocialProperties = {
    items: SocialItem[];
    iconSize: number;
    spacing: number;
    align: Align;
    shape: 'circle' | 'rounded' | 'square';
    padding: Padding;
    paddingLink: boolean;
};

export type HtmlProperties = {
    html: string;
    padding: Padding;
    paddingLink: boolean;
};

export type MenuItem = {
    id: string;
    text: string;
    href: string;
};

export type MenuProperties = {
    items: MenuItem[];
    layout: 'horizontal' | 'vertical';
    align: Align;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    color: RGBColor;
    inheritColor: boolean;
    separator: string;
    itemPadding: Padding;
    itemPaddingLink: boolean;
    padding: Padding;
    paddingLink: boolean;
};

export type SpacerProperties = {
    height: number;
};

export type PropertiesOf = {
    Canvas: CanvasProperties;
    Row: RowProperties;
    Column: ColumnProperties;
    Heading: HeadingProperties;
    Text: TextProperties;
    Divider: DividerProperties;
    Button: ButtonProperties;
    List: ListProperties;
    Image: ImageProperties;
    Video: VideoProperties;
    Social: SocialProperties;
    HTML: HtmlProperties;
    Menu: MenuProperties;
    Spacer: SpacerProperties;
};
