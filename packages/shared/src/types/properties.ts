import type { Align, Border, Padding, RGBColor } from './common';

/** Per-device visibility shared by rows and every content block. */
export type Visibility = {
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
};

export type MergeTag = {
    tag: string;
    label: string;
    sample: string;
};

export type CanvasProperties = {
    mergeTags: MergeTag[];
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

export type RowProperties = Visibility & {
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

export type TextLikeProperties = Visibility & {
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

export type DividerProperties = Visibility & {
    width: number;
    thickness: number;
    style: 'solid' | 'dashed' | 'dotted';
    color: RGBColor;
    align: Align;
    padding: Padding;
    paddingLink: boolean;
};

export type ButtonProperties = Visibility & {
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

export type ListProperties = Visibility & {
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

export type ImageProperties = Visibility & {
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

export type VideoProperties = Visibility & {
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

export type SocialProperties = Visibility & {
    items: SocialItem[];
    iconSize: number;
    spacing: number;
    align: Align;
    shape: 'circle' | 'rounded' | 'square';
    padding: Padding;
    paddingLink: boolean;
};

export type HtmlProperties = Visibility & {
    html: string;
    padding: Padding;
    paddingLink: boolean;
};

export type MenuItem = {
    id: string;
    text: string;
    href: string;
};

export type MenuProperties = Visibility & {
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

export type SpacerProperties = Visibility & {
    height: number;
};

export type TableProperties = Visibility & {
    rows: string[][];
    headerRow: boolean;
    headerBackground: RGBColor;
    headerColor: RGBColor;
    stripe: boolean;
    stripeColor: RGBColor;
    borderColor: RGBColor;
    borderWidth: number;
    cellPadding: number;
    fontSize: number;
    align: Align;
    width: number;
    padding: Padding;
    paddingLink: boolean;
};

export type IconItem = {
    id: string;
    icon: string;
    iconUrl: string;
    title: string;
    text: string;
};

export type IconsProperties = Visibility & {
    items: IconItem[];
    layout: 'vertical' | 'horizontal';
    iconSize: number;
    iconBackground: RGBColor;
    iconColor: RGBColor;
    iconShape: 'circle' | 'rounded' | 'square';
    fontSize: number;
    titleWeight: 'normal' | 'bold';
    gap: number;
    align: Align;
    padding: Padding;
    paddingLink: boolean;
};

export type ProductProperties = Visibility & {
    image: string;
    imageAlt: string;
    title: string;
    description: string;
    price: string;
    oldPrice: string;
    buttonText: string;
    buttonHref: string;
    buttonBackground: RGBColor;
    buttonColor: RGBColor;
    layout: 'vertical' | 'horizontal';
    imageWidth: number;
    align: Align;
    backgroundColor: RGBColor;
    border: Border;
    fontSize: number;
    padding: Padding;
    paddingLink: boolean;
};

export type QuoteProperties = Visibility & {
    text: string;
    author: string;
    role: string;
    avatar: string;
    rating: number;
    showMarks: boolean;
    italic: boolean;
    accentColor: RGBColor;
    backgroundColor: RGBColor;
    color: RGBColor;
    inheritColor: boolean;
    fontSize: number;
    align: Align;
    padding: Padding;
    paddingLink: boolean;
};

export type CouponProperties = Visibility & {
    label: string;
    code: string;
    description: string;
    backgroundColor: RGBColor;
    borderColor: RGBColor;
    codeColor: RGBColor;
    codeBackground: RGBColor;
    codeSize: number;
    align: Align;
    padding: Padding;
    paddingLink: boolean;
};

export type CalloutProperties = Visibility & {
    icon: string;
    title: string;
    text: string;
    backgroundColor: RGBColor;
    accentColor: RGBColor;
    color: RGBColor;
    radius: number;
    fontSize: number;
    padding: Padding;
    paddingLink: boolean;
};

export type FooterProperties = Visibility & {
    company: string;
    address: string;
    text: string;
    unsubscribeText: string;
    unsubscribeHref: string;
    preferencesText: string;
    preferencesHref: string;
    fontSize: number;
    color: RGBColor;
    linkColor: RGBColor;
    align: Align;
    padding: Padding;
    paddingLink: boolean;
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
    Table: TableProperties;
    Icons: IconsProperties;
    Product: ProductProperties;
    Quote: QuoteProperties;
    Coupon: CouponProperties;
    Callout: CalloutProperties;
    Footer: FooterProperties;
};
