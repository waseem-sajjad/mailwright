/**
 * Compact template DSL: the text Gemini writes and the rules engine emits.
 * It is short, strict and expands into the builder's EmailNode tree.
 *
 *   title: Welcome to ACME
 *   preheader: Three quick things to get you started
 *   brand: #2563eb
 *   bg: #f2f2f2
 *   row dark: heading "ACME"; menu "Home" "About" "Contact"
 *   row: image; heading "Welcome aboard"; text "We're thrilled..."; button "Get started" https://acme.com
 *   row 3: icons "✓ Fast setup|Connect in minutes" "★ Loved|Rated 4.9" "♥ Support|Real people"
 *   row 1-2: image | heading "Story"; text "Teaser"; button "Read more"
 *   row light: social; footer "ACME Inc" "123 Example St, Sydney"
 */
import type { CanvasNode, ColumnLayout, EmailNode, RGBColor } from '@mailwright/shared/types';
import { createCanvas, createContent, createRow, iconItem, newId, rgb } from '@mailwright/shared/utils';

export interface DslBlock {
    kind: string;
    args: string[];
    url?: string;
}

export interface DslRow {
    layout: string;
    style: 'plain' | 'light' | 'dark' | 'brand';
    columns: DslBlock[][];
}

export interface DslDocument {
    title: string;
    preheader: string;
    brand: string;
    bg: string;
    rows: DslRow[];
}

const LAYOUTS: Record<string, ColumnLayout> = {
    '1': [100],
    '2': [50, 50],
    '3': [33.33, 33.33, 33.34],
    '4': [25, 25, 25, 25],
    '1-2': [33.33, 66.67],
    '2-1': [66.67, 33.33],
    '1-2-1': [25, 50, 25],
};

export const BLOCK_KINDS = [
    'heading',
    'text',
    'button',
    'image',
    'divider',
    'spacer',
    'list',
    'menu',
    'social',
    'footer',
    'icons',
    'product',
    'quote',
    'coupon',
    'callout',
    'table',
    'video',
] as const;

const hexToRgb = (hex: string, fallback: RGBColor): RGBColor => {
    const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
    if (!m) return fallback;
    const n = parseInt(m[1], 16);
    return rgb((n >> 16) & 255, (n >> 8) & 255, n & 255);
};

const parseBlock = (raw: string): DslBlock | null => {
    const source = raw.trim();
    if (!source) return null;
    const kindMatch = source.match(/^([a-z]+)/i);
    if (!kindMatch) return null;
    const kind = kindMatch[1].toLowerCase();
    if (!(BLOCK_KINDS as readonly string[]).includes(kind)) return null;
    const rest = source.slice(kind.length).trim();
    const args = [...rest.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
    const withoutQuotes = rest.replace(/"[^"]*"/g, ' ').trim();
    const url = withoutQuotes.match(/https?:\/\/\S+|\{\{[^}]+\}\}/)?.[0];
    const number = withoutQuotes.match(/\b\d+\b/)?.[0];
    if (args.length === 0 && withoutQuotes && !url && !number) {
        // Unquoted text after the keyword: treat as a single argument.
        args.push(withoutQuotes);
    }
    if (number && kind === 'spacer') args.push(number);
    return { kind, args, url };
};

const parseRowHeader = (header: string): { layout: string; style: DslRow['style'] } => {
    const tokens = header.trim().split(/\s+/).slice(1);
    let layout = '1';
    let style: DslRow['style'] = 'plain';
    tokens.forEach((token) => {
        const t = token.toLowerCase();
        if (LAYOUTS[t]) layout = t;
        else if (t === 'light' || t === 'dark' || t === 'brand') style = t;
    });
    return { layout, style };
};

/** Parses DSL text. Tolerant: unknown lines and blocks are skipped. */
export const parseDsl = (text: string): DslDocument => {
    const doc: DslDocument = {
        title: '',
        preheader: '',
        brand: '#2563eb',
        bg: '#f2f2f2',
        rows: [],
    };
    text.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        const kv = trimmed.match(/^(title|preheader|brand|bg)\s*:\s*(.*)$/i);
        if (kv) {
            const key = kv[1].toLowerCase() as 'title' | 'preheader' | 'brand' | 'bg';
            doc[key] = kv[2].trim();
            return;
        }
        const rowMatch = trimmed.match(/^(row[^:]*):\s*(.*)$/i);
        if (!rowMatch) return;
        const { layout, style } = parseRowHeader(rowMatch[1]);
        const columns = rowMatch[2].split('|').map((column) =>
            column
                .split(';')
                .map(parseBlock)
                .filter((b): b is DslBlock => b !== null),
        );
        doc.rows.push({ layout, style, columns });
    });
    return doc;
};

const setText = (node: EmailNode, patch: object): EmailNode => ({
    ...node,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    properties: { ...node.properties, ...patch },
});

interface Theme {
    brand: RGBColor;
    dark: boolean;
}

const splitPair = (value: string, separator = '|'): [string, string] => {
    const index = value.indexOf(separator);
    if (index === -1) return [value.trim(), ''];
    return [value.slice(0, index).trim(), value.slice(index + 1).trim()];
};

/**
 * Model output uses example.com for images it cannot know. Those links are
 * dead, so they become branded placeholders that render in previews and
 * exports (real URLs pass through untouched).
 */
const placeholderImage = (url: string | undefined, label: string, size: string, brand: RGBColor): string => {
    if (url && !/^https?:\/\/(www\.)?example\.(com|org|net)\b/i.test(url)) return url;
    const hex = [brand.r, brand.g, brand.b].map((c) => c.toString(16).padStart(2, '0')).join('');
    const text = encodeURIComponent(
        label
            .replace(/[^\w\s-]/g, '')
            .trim()
            .split(/\s+/)
            .slice(0, 4)
            .join(' ') || 'Image',
    );
    return `https://placehold.co/${size}/${hex}/ffffff?text=${text}`;
};

const blockToNode = (block: DslBlock, theme: Theme): EmailNode | null => {
    const { kind, args, url } = block;
    const white = rgb(255, 255, 255);
    const textColor = theme.dark ? { inheritColor: false, color: white } : {};
    switch (kind) {
        case 'heading':
            return setText(createContent('Heading'), {
                text: args[0] ?? 'Heading',
                align: 'center',
                ...textColor,
            });
        case 'text':
            return setText(createContent('Text'), {
                text: args[0] ?? '',
                align: 'center',
                ...textColor,
            });
        case 'button':
            return setText(createContent('Button'), {
                text: args[0] ?? 'Learn more',
                href: url ?? 'https://example.com',
                backgroundColor: theme.dark ? white : theme.brand,
                color: theme.dark ? theme.brand : white,
            });
        case 'image':
            return setText(createContent('Image'), {
                src: placeholderImage(url, args[0] ?? 'Image', '600x320', theme.brand),
                alt: args[0] ?? 'Image',
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
            });
        case 'divider':
            return createContent('Divider');
        case 'spacer':
            return setText(createContent('Spacer'), {
                height: Number(args[0]) || 24,
            });
        case 'list':
            return setText(createContent('List'), {
                items: args.length > 0 ? args : ['First item', 'Second item'],
                ...textColor,
            });
        case 'menu':
            return setText(createContent('Menu'), {
                items: (args.length > 0 ? args : ['Home', 'About']).map((t) => ({
                    id: newId(),
                    text: t,
                    href: 'https://example.com',
                })),
                ...textColor,
            });
        case 'social':
            return createContent('Social');
        case 'footer':
            return setText(createContent('Footer'), {
                company: args[0] ?? 'Company',
                address: args[1] ?? '',
                ...(theme.dark ? { color: rgb(209, 213, 219), linkColor: rgb(209, 213, 219) } : {}),
            });
        case 'icons':
            return setText(createContent('Icons'), {
                items: (args.length > 0 ? args : ['✓ Feature|Description']).map((a) => {
                    const [head, text] = splitPair(a);
                    const icon = head.match(/^\S+/)?.[0] ?? '✓';
                    const title = head.slice(icon.length).trim() || 'Feature';
                    return iconItem(icon, title, text);
                }),
                layout: 'horizontal',
                align: 'center',
                iconBackground: theme.dark ? white : rgb(219, 234, 254),
                iconColor: theme.brand,
                ...textColor,
            });
        case 'product':
            return setText(createContent('Product'), {
                title: args[0] ?? 'Product',
                price: args[1] ?? '$0.00',
                oldPrice: args[2] ?? '',
                image: placeholderImage(url, args[0] ?? 'Product', '400x400', theme.brand),
                buttonBackground: theme.brand,
            });
        case 'quote':
            return setText(createContent('Quote'), {
                text: args[0] ?? '',
                author: args[1] ?? '',
                role: args[2] ?? '',
                accentColor: theme.brand,
            });
        case 'coupon':
            return setText(createContent('Coupon'), {
                code: args[0] ?? 'SAVE10',
                label: args[1] ?? 'Use code at checkout',
                description: args[2] ?? '',
            });
        case 'callout':
            return setText(createContent('Callout'), {
                title: args[0] ?? '',
                text: args[1] ?? '',
                accentColor: theme.brand,
            });
        case 'table': {
            const rows = (args.length > 0 ? args : ['Item,Qty', 'Sample,1']).map((row) =>
                row.split(',').map((c) => c.trim()),
            );
            const width = Math.max(...rows.map((r) => r.length));
            return setText(createContent('Table'), {
                rows: rows.map((r) => [...r, ...Array.from({ length: width - r.length }, () => '')]),
            });
        }
        case 'video':
            return setText(createContent('Video'), {
                url: url ?? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            });
        default:
            return null;
    }
};

/** Expands a parsed DSL document into a builder canvas tree. */
export const dslToTree = (doc: DslDocument): CanvasNode => {
    const canvas = createCanvas();
    const brand = hexToRgb(doc.brand, rgb(37, 99, 235));
    const bg = hexToRgb(doc.bg, rgb(242, 242, 242));
    const rows = doc.rows.map((row) => {
        const layout = LAYOUTS[row.layout] ?? LAYOUTS['1'];
        const node = createRow(layout);
        const dark = row.style === 'dark' || row.style === 'brand';
        const theme: Theme = { brand, dark };
        const contentBackground = (() => {
            if (row.style === 'dark') return rgb(17, 24, 39);
            if (row.style === 'brand') return brand;
            if (row.style === 'light') return rgb(243, 244, 246);
            return rgb(255, 255, 255);
        })();
        const columns = node.children.map((column, index) => ({
            ...column,
            children: (row.columns[index] ?? [])
                .map((block) => blockToNode(block, theme))
                .filter((n): n is EmailNode => n !== null),
        }));
        return {
            ...node,
            properties: { ...node.properties, contentBackgroundColor: contentBackground },
            children: columns,
        };
    });
    return {
        ...canvas,
        properties: {
            ...canvas.properties,
            title: doc.title || 'Untitled email',
            preheaderText: doc.preheader,
            backgroundColor: bg,
            linkColor: brand,
        },
        children: rows,
    };
};

/** Serialises a DSL document back to text (used for datasets and history). */
export const stringifyDsl = (doc: DslDocument): string => {
    const q = (s: string) => `"${s.replace(/"/g, "'")}"`;
    const block = (b: DslBlock) => [b.kind, ...b.args.map(q), b.url ?? ''].filter(Boolean).join(' ');
    const lines = [
        `title: ${doc.title}`,
        `preheader: ${doc.preheader}`,
        `brand: ${doc.brand}`,
        `bg: ${doc.bg}`,
        ...doc.rows.map((row) => {
            const header = ['row', row.layout !== '1' ? row.layout : '', row.style !== 'plain' ? row.style : '']
                .filter(Boolean)
                .join(' ');
            return `${header}: ${row.columns.map((c) => c.map(block).join('; ')).join(' | ')}`;
        }),
    ];
    return lines.join('\n');
};
