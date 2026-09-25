import type {
    ButtonProperties,
    CanvasNode,
    CanvasProperties,
    ColumnLayout,
    ColumnNode,
    ColumnProperties,
    ComponentType,
    ContentType,
    DividerProperties,
    EmailNode,
    HeadingProperties,
    HtmlProperties,
    ImageProperties,
    ListProperties,
    MenuProperties,
    Padding,
    RowNode,
    RowProperties,
    SocialItem,
    SocialNetwork,
    SocialProperties,
    SpacerProperties,
    TextProperties,
    VideoProperties,
} from '@/types';

import { rgb, uniformPadding } from './helper';
import { newId } from './tree';

export const PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300"><rect width="600" height="300" fill="#e5e7eb"/><g fill="#9ca3af"><circle cx="230" cy="120" r="28"/><path d="M120 230l110-95 80 70 60-45 110 70z"/></g><text x="300" y="275" text-anchor="middle" font-family="Arial" font-size="18" fill="#6b7280">Drop an image URL in the settings panel</text></svg>',
)}`;

export const FONT_FAMILIES: { label: string; value: string }[] = [
    { label: 'Inherit', value: 'inherit' },
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    {
        label: 'Helvetica Neue',
        value: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { label: 'Courier New', value: "'Courier New', Courier, monospace" },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
    { label: 'Trebuchet MS', value: "'Trebuchet MS', Helvetica, sans-serif" },
    {
        label: 'Lucida Sans',
        value: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
    },
];

export const COLUMN_LAYOUTS: { label: string; value: ColumnLayout }[] = [
    { label: '1', value: [100] },
    { label: '1/2 · 1/2', value: [50, 50] },
    { label: '1/3 · 2/3', value: [33.33, 66.67] },
    { label: '2/3 · 1/3', value: [66.67, 33.33] },
    { label: '1/3 · 1/3 · 1/3', value: [33.33, 33.33, 33.34] },
    { label: '1/4 × 4', value: [25, 25, 25, 25] },
    { label: '1/4 · 1/2 · 1/4', value: [25, 50, 25] },
];

export const SOCIAL_NETWORKS: Record<
    SocialNetwork,
    { label: string; color: string; short: string }
> = {
    facebook: { label: 'Facebook', color: '#1877F2', short: 'f' },
    instagram: { label: 'Instagram', color: '#E4405F', short: 'ig' },
    x: { label: 'X (Twitter)', color: '#000000', short: 'X' },
    linkedin: { label: 'LinkedIn', color: '#0A66C2', short: 'in' },
    youtube: { label: 'YouTube', color: '#FF0000', short: '▶' },
    tiktok: { label: 'TikTok', color: '#000000', short: 'tt' },
    pinterest: { label: 'Pinterest', color: '#BD081C', short: 'P' },
    website: { label: 'Website', color: '#4B5563', short: 'www' },
    email: { label: 'Email', color: '#6B7280', short: '@' },
};

const zero: Padding = uniformPadding(0);

const white = rgb(255, 255, 255);
const transparent = rgb(255, 255, 255, 0);
const dark = rgb(17, 24, 39);

export const canvasDefaults = (): CanvasProperties => ({
    backgroundColor: rgb(242, 242, 242),
    contentBackgroundColor: transparent,
    fontFamily: 'Arial, Helvetica, sans-serif',
    color: dark,
    linkColor: rgb(37, 99, 235),
    preheaderText: '',
    contentWidth: 600,
    title: 'Untitled email',
});

export const rowDefaults = (): RowProperties => ({
    backgroundColor: transparent,
    contentBackgroundColor: white,
    backgroundImage: '',
    padding: zero,
    paddingLink: true,
    contentAlign: 'center',
    stack: true,
    layout: [100],
});

export const columnDefaults = (width = 100): ColumnProperties => ({
    backgroundColor: transparent,
    padding: uniformPadding(10),
    paddingLink: true,
    border: { style: 'none', color: rgb(209, 213, 219), width: 0, radius: 0 },
    verticalAlign: 'top',
    width,
});

const textBase = () => ({
    align: 'left' as const,
    letterSpacing: 0,
    fontFamily: 'inherit',
    color: dark,
    inheritColor: true,
    padding: uniformPadding(10),
    paddingLink: true,
});

export const headingDefaults = (): HeadingProperties => ({
    ...textBase(),
    text: 'Write a heading',
    level: 'h1',
    fontSize: 28,
    lineHeight: 1.3,
    fontWeight: 'bold',
});

export const textDefaults = (): TextProperties => ({
    ...textBase(),
    text: 'This is a new text block. Click to edit, then use the settings panel on the right to change typography, colour and spacing.',
    fontSize: 14,
    lineHeight: 1.6,
    fontWeight: 'normal',
});

export const dividerDefaults = (): DividerProperties => ({
    width: 100,
    thickness: 1,
    style: 'solid',
    color: rgb(209, 213, 219),
    align: 'center',
    padding: uniformPadding(10),
    paddingLink: true,
});

export const buttonDefaults = (): ButtonProperties => ({
    text: 'Click me',
    href: 'https://example.com',
    target: '_blank',
    align: 'center',
    fullWidth: false,
    backgroundColor: rgb(37, 99, 235),
    color: white,
    fontSize: 14,
    fontWeight: 'bold',
    border: { style: 'none', color: rgb(37, 99, 235), width: 0, radius: 4 },
    innerPadding: { top: 12, right: 24, bottom: 12, left: 24 },
    innerPaddingLink: false,
    padding: uniformPadding(10),
    paddingLink: true,
});

export const listDefaults = (): ListProperties => ({
    items: ['First item', 'Second item', 'Third item'],
    ordered: false,
    fontSize: 14,
    lineHeight: 1.6,
    color: dark,
    inheritColor: true,
    align: 'left',
    padding: uniformPadding(10),
    paddingLink: true,
});

export const imageDefaults = (): ImageProperties => ({
    src: '',
    alt: 'Image',
    href: '',
    width: 100,
    autoWidth: true,
    align: 'center',
    borderRadius: 0,
    padding: uniformPadding(10),
    paddingLink: true,
});

export const videoDefaults = (): VideoProperties => ({
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: '',
    autoThumbnail: true,
    alt: 'Watch the video',
    width: 100,
    align: 'center',
    playButton: true,
    padding: uniformPadding(10),
    paddingLink: true,
});

export const socialItem = (network: SocialNetwork): SocialItem => ({
    id: newId(),
    network,
    href: 'https://',
    iconUrl: '',
});

export const socialDefaults = (): SocialProperties => ({
    items: [
        socialItem('facebook'),
        socialItem('instagram'),
        socialItem('linkedin'),
    ],
    iconSize: 32,
    spacing: 8,
    align: 'center',
    shape: 'circle',
    padding: uniformPadding(10),
    paddingLink: true,
});

export const htmlDefaults = (): HtmlProperties => ({
    html: '<p style="margin:0;">Paste your <strong>custom HTML</strong> here.</p>',
    padding: uniformPadding(10),
    paddingLink: true,
});

export const menuDefaults = (): MenuProperties => ({
    items: [
        { id: newId(), text: 'Home', href: 'https://example.com' },
        { id: newId(), text: 'About', href: 'https://example.com/about' },
        { id: newId(), text: 'Contact', href: 'https://example.com/contact' },
    ],
    layout: 'horizontal',
    align: 'center',
    fontSize: 14,
    fontWeight: 'normal',
    color: dark,
    inheritColor: true,
    separator: '',
    itemPadding: { top: 5, right: 15, bottom: 5, left: 15 },
    itemPaddingLink: false,
    padding: uniformPadding(10),
    paddingLink: true,
});

export const spacerDefaults = (): SpacerProperties => ({
    height: 30,
});

const contentDefaults: Record<ContentType, () => Record<string, unknown>> = {
    Heading: headingDefaults,
    Text: textDefaults,
    Divider: dividerDefaults,
    Button: buttonDefaults,
    List: listDefaults,
    Image: imageDefaults,
    Video: videoDefaults,
    Social: socialDefaults,
    HTML: htmlDefaults,
    Menu: menuDefaults,
    Spacer: spacerDefaults,
};

export const createColumn = (width = 100): ColumnNode => ({
    id: newId(),
    type: 'Column',
    properties: columnDefaults(width),
    children: [],
});

export const createRow = (layout: ColumnLayout = [100]): RowNode => ({
    id: newId(),
    type: 'Row',
    properties: { ...rowDefaults(), layout },
    children: layout.map((width) => createColumn(width)),
});

export const createContent = (type: ContentType): EmailNode => ({
    id: newId(),
    type,
    properties: contentDefaults[type](),
    children: [],
});

export const createCanvas = (): CanvasNode => ({
    id: newId(),
    type: 'Canvas',
    properties: canvasDefaults(),
    children: [],
});

export const createNode = (type: ComponentType): EmailNode => {
    if (type === 'Canvas') return createCanvas();
    if (type === 'Row') return createRow();
    if (type === 'Column') return createColumn();
    return createContent(type);
};

export const isContentType = (type: ComponentType): type is ContentType =>
    type !== 'Canvas' && type !== 'Row' && type !== 'Column';

/** Re-shapes a row's columns to match a layout, preserving content. */
export const applyLayout = (row: RowNode, layout: ColumnLayout): RowNode => {
    const columns: ColumnNode[] = layout.map((width, index) => {
        const existing = row.children[index] as ColumnNode | undefined;
        if (existing) {
            return {
                ...existing,
                properties: { ...existing.properties, width },
            };
        }
        return createColumn(width);
    });

    // Content from removed columns is folded into the last surviving column.
    const orphans = row.children
        .slice(layout.length)
        .flatMap((column) => column.children);
    if (orphans.length > 0) {
        const last = columns[columns.length - 1];
        columns[columns.length - 1] = {
            ...last,
            children: [...last.children, ...orphans],
        };
    }

    return {
        ...row,
        properties: { ...row.properties, layout },
        children: columns,
    };
};
