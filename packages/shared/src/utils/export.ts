import type {
    Align,
    ButtonProperties,
    CalloutProperties,
    CanvasNode,
    CanvasProperties,
    ColumnNode,
    CouponProperties,
    DividerProperties,
    EmailNode,
    FooterProperties,
    HeadingProperties,
    HtmlProperties,
    IconsProperties,
    ImageProperties,
    ListProperties,
    MenuProperties,
    ProductProperties,
    QuoteProperties,
    RowNode,
    SocialProperties,
    SpacerProperties,
    TableProperties,
    TextProperties,
    VideoProperties,
    Visibility,
} from '../types';

import {
    borderCss,
    escapeHtml,
    isLightColor,
    isTransparent,
    lighten,
    paddingCss,
    relativeLuminance,
    rgbaToCss,
    videoThumbnail,
} from './helper';
import {
    googleFamiliesFor,
    googleFontsUrl,
    PLACEHOLDER_IMAGE,
    SOCIAL_NETWORKS,
} from './factory';

interface Context {
    canvas: CanvasProperties;
    contentWidth: number;
}

const TABLE = 'role="presentation" cellpadding="0" cellspacing="0" border="0"';

const resolveFont = (font: string, ctx: Context): string =>
    font === 'inherit' || !font ? ctx.canvas.fontFamily : font;

const resolveColor = (
    inherit: boolean,
    color: Parameters<typeof rgbaToCss>[0],
    ctx: Context,
): string => (inherit ? rgbaToCss(ctx.canvas.color) : rgbaToCss(color));

const bgAttr = (color: Parameters<typeof rgbaToCss>[0]): string =>
    isTransparent(color) ? '' : ` bgcolor="${rgbaToCss(color)}"`;

/** CSS classes that the media query uses to hide a block per device. */
const visibilityClass = (p: Visibility, ...extra: string[]): string => {
    const classes: string[] = extra.filter(Boolean);
    if (p.hideOnMobile) classes.push('hide-mobile');
    if (p.hideOnDesktop) classes.push('hide-desktop');
    return classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
};

/*
 * Dark-mode hooks. Clients that honour `prefers-color-scheme` (Apple Mail,
 * iOS Mail, Outlook.com and the new Outlook apps) get a designed dark
 * theme through these classes instead of an automatic inversion:
 *   mw-page        the outer canvas background
 *   mw-row-light   a row band with a light background
 *   mw-cbg-light   a content container / column with a light background
 *   mw-text-dark   dark text that must turn light
 *   mw-line-light  light divider lines
 * Gmail ignores all of it and inverts on its own; the pre-flight check
 * simulates that case instead.
 */
const darkTextClass = (css: string): string => {
    const m = css.match(/^#([0-9a-f]{6})$/i);
    if (!m) return '';
    const n = parseInt(m[1], 16);
    const lum = relativeLuminance({ r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 });
    return lum < 0.4 ? 'mw-text-dark' : '';
};

const lightBgClass = (color: Parameters<typeof rgbaToCss>[0], name: string): string =>
    !isTransparent(color) && isLightColor(color) ? name : '';

const visibilityStyle = (p: Visibility): string =>
    p.hideOnDesktop
        ? 'display:none;max-height:0;overflow:hidden;mso-hide:all;'
        : '';

const wrap = (
    inner: string,
    padding: { top: number; right: number; bottom: number; left: number },
    align: Align = 'left',
    p: Visibility = {},
): string =>
    `<table ${TABLE} width="100%"${visibilityClass(p)} style="${visibilityStyle(p)}"><tr><td align="${align}" style="padding:${paddingCss(padding)};">${inner}</td></tr></table>`;

const renderHeading = (p: HeadingProperties, ctx: Context): string => {
    const style = [
        'margin:0',
        `font-family:${resolveFont(p.fontFamily, ctx)}`,
        `font-size:${p.fontSize}px`,
        `line-height:${p.lineHeight}`,
        `letter-spacing:${p.letterSpacing}px`,
        `font-weight:${p.fontWeight}`,
        `color:${resolveColor(p.inheritColor, p.color, ctx)}`,
        `text-align:${p.align}`,
    ].join(';');
    const cls = darkTextClass(resolveColor(p.inheritColor, p.color, ctx));
    return wrap(
        `<${p.level}${cls ? ` class="${cls}"` : ''} style="${style};">${p.text}</${p.level}>`,
        p.padding,
        p.align,
        p,
    );
};

const renderText = (p: TextProperties, ctx: Context): string => {
    const style = [
        'margin:0',
        `font-family:${resolveFont(p.fontFamily, ctx)}`,
        `font-size:${p.fontSize}px`,
        `line-height:${p.lineHeight}`,
        `letter-spacing:${p.letterSpacing}px`,
        `font-weight:${p.fontWeight}`,
        `color:${resolveColor(p.inheritColor, p.color, ctx)}`,
        `text-align:${p.align}`,
    ].join(';');
    const cls = darkTextClass(resolveColor(p.inheritColor, p.color, ctx));
    return wrap(
        `<div${cls ? ` class="${cls}"` : ''} style="${style};">${p.text}</div>`,
        p.padding,
        p.align,
        p,
    );
};

const renderDivider = (p: DividerProperties): string =>
    wrap(
        `<table ${TABLE} width="${p.width}%" align="${p.align}" style="width:${p.width}%;"><tr><td${isLightColor(p.color) ? ' class="mw-line-light"' : ''} style="border-top:${p.thickness}px ${p.style} ${rgbaToCss(p.color)};font-size:0;line-height:0;">&nbsp;</td></tr></table>`,
        p.padding,
        p.align,
        p,
    );

const renderButton = (p: ButtonProperties, ctx: Context): string => {
    const { radius } = p.border;
    const bg = rgbaToCss(p.backgroundColor);
    const cellStyle = [
        `background-color:${bg}`,
        `border-radius:${radius}px`,
        `border:${borderCss(p.border)}`,
        'text-align:center',
    ].join(';');
    const linkStyle = [
        'display:inline-block',
        `padding:${paddingCss(p.innerPadding)}`,
        `font-family:${ctx.canvas.fontFamily}`,
        `font-size:${p.fontSize}px`,
        `font-weight:${p.fontWeight}`,
        `color:${rgbaToCss(p.color)}`,
        'text-decoration:none',
        `border-radius:${radius}px`,
        'line-height:1.2',
        p.fullWidth ? 'width:100%;box-sizing:border-box' : '',
    ]
        .filter(Boolean)
        .join(';');
    const width = p.fullWidth ? ' width="100%"' : '';
    return wrap(
        `<table ${TABLE} align="${p.align}"${width}><tr><td${bgAttr(p.backgroundColor)} style="${cellStyle};"><a href="${escapeHtml(p.href)}" target="${p.target}" style="${linkStyle};">${escapeHtml(p.text)}</a></td></tr></table>`,
        p.padding,
        p.align,
        p,
    );
};

const renderList = (p: ListProperties, ctx: Context): string => {
    const tag = p.ordered ? 'ol' : 'ul';
    const style = [
        'margin:0',
        'padding-left:22px',
        `font-family:${ctx.canvas.fontFamily}`,
        `font-size:${p.fontSize}px`,
        `line-height:${p.lineHeight}`,
        `color:${resolveColor(p.inheritColor, p.color, ctx)}`,
        `text-align:${p.align}`,
    ].join(';');
    const items = p.items
        .map((item) => `<li style="margin:0 0 4px 0;">${item}</li>`)
        .join('');
    const cls = darkTextClass(resolveColor(p.inheritColor, p.color, ctx));
    return wrap(
        `<${tag}${cls ? ` class="${cls}"` : ''} style="${style};">${items}</${tag}>`,
        p.padding,
        p.align,
        p,
    );
};

const renderImage = (p: ImageProperties, ctx: Context): string => {
    const src = p.src || PLACEHOLDER_IMAGE;
    const px = Math.round((ctx.contentWidth * p.width) / 100);
    const widthAttr = p.autoWidth ? '' : ` width="${px}"`;
    const style = [
        'display:block',
        p.autoWidth ? 'width:auto' : `width:${px}px`,
        'max-width:100%',
        'height:auto',
        'border:0',
        `border-radius:${p.borderRadius}px`,
    ].join(';');
    let img = `<img src="${escapeHtml(src)}" alt="${escapeHtml(p.alt)}"${widthAttr} style="${style};" />`;
    if (p.href) {
        img = `<a href="${escapeHtml(p.href)}" target="_blank" style="display:inline-block;">${img}</a>`;
    }
    return wrap(img, p.padding, p.align, p);
};

const renderVideo = (p: VideoProperties, ctx: Context): string => {
    const thumb =
        (p.autoThumbnail ? videoThumbnail(p.url) : p.thumbnail) ||
        p.thumbnail ||
        PLACEHOLDER_IMAGE;
    const px = Math.round((ctx.contentWidth * p.width) / 100);
    const height = Math.round((px * 9) / 16);
    const img = `<img src="${escapeHtml(thumb)}" alt="${escapeHtml(p.alt)}" width="${px}" style="display:block;width:${px}px;max-width:100%;height:auto;border:0;" />`;
    if (!p.playButton) {
        return wrap(
            `<a href="${escapeHtml(p.url)}" target="_blank" style="display:inline-block;">${img}</a>`,
            p.padding,
            p.align,
            p,
        );
    }
    const play = `<a href="${escapeHtml(p.url)}" target="_blank" style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:32px;background-color:rgba(0,0,0,0.6);color:#ffffff;font-size:28px;text-align:center;text-decoration:none;font-family:Arial,sans-serif;">&#9654;</a>`;
    const inner = `<!--[if mso]><a href="${escapeHtml(p.url)}">${img}</a><![endif]--><!--[if !mso]><!--><table ${TABLE} width="${px}" style="width:${px}px;max-width:100%;background-image:url('${escapeHtml(thumb)}');background-size:cover;background-position:center;" background="${escapeHtml(thumb)}"><tr><td align="center" valign="middle" height="${height}" style="height:${height}px;">${play}</td></tr></table><!--<![endif]-->`;
    return wrap(inner, p.padding, p.align, p);
};

const socialRadius = (shape: SocialProperties['shape'], size: number) => {
    if (shape === 'circle') return size / 2;
    if (shape === 'rounded') return 6;
    return 0;
};

const renderSocial = (p: SocialProperties): string => {
    const radius = socialRadius(p.shape, p.iconSize);
    const cells = p.items
        .map((item) => {
            const network = SOCIAL_NETWORKS[item.network];
            let icon: string;
            if (item.iconUrl) {
                icon = `<img src="${escapeHtml(item.iconUrl)}" alt="${network.label}" width="${p.iconSize}" height="${p.iconSize}" style="display:block;width:${p.iconSize}px;height:${p.iconSize}px;border:0;border-radius:${radius}px;" />`;
            } else {
                const fontSize = Math.round(p.iconSize * 0.42);
                icon = `<table ${TABLE}><tr><td bgcolor="${network.color}" width="${p.iconSize}" height="${p.iconSize}" align="center" valign="middle" style="width:${p.iconSize}px;height:${p.iconSize}px;border-radius:${radius}px;background-color:${network.color};color:#ffffff;font-family:Arial,sans-serif;font-size:${fontSize}px;font-weight:bold;line-height:${p.iconSize}px;text-align:center;">${network.short}</td></tr></table>`;
            }
            return `<td style="padding:0 ${p.spacing / 2}px;"><a href="${escapeHtml(item.href)}" target="_blank" style="display:inline-block;text-decoration:none;">${icon}</a></td>`;
        })
        .join('');
    return wrap(
        `<table ${TABLE} align="${p.align}"><tr>${cells}</tr></table>`,
        p.padding,
        p.align,
        p,
    );
};

const renderHtml = (p: HtmlProperties): string =>
    wrap(p.html, p.padding, 'left', p);

const renderMenu = (p: MenuProperties, ctx: Context): string => {
    const linkStyle = [
        `font-family:${ctx.canvas.fontFamily}`,
        `font-size:${p.fontSize}px`,
        `font-weight:${p.fontWeight}`,
        `color:${resolveColor(p.inheritColor, p.color, ctx)}`,
        'text-decoration:none',
        'display:inline-block',
    ].join(';');
    const items = p.items.map(
        (item) =>
            `<a href="${escapeHtml(item.href)}" target="_blank" style="${linkStyle};">${escapeHtml(item.text)}</a>`,
    );
    const pad = paddingCss(p.itemPadding);
    let inner: string;
    if (p.layout === 'horizontal') {
        const cells = items
            .map((link, i) => {
                const sep =
                    p.separator && i < items.length - 1
                        ? `<td style="padding:${pad};color:${resolveColor(p.inheritColor, p.color, ctx)};">${escapeHtml(p.separator)}</td>`
                        : '';
                return `<td style="padding:${pad};">${link}</td>${sep}`;
            })
            .join('');
        inner = `<table ${TABLE} align="${p.align}"><tr>${cells}</tr></table>`;
    } else {
        const rows = items
            .map(
                (link) =>
                    `<tr><td align="${p.align}" style="padding:${pad};">${link}</td></tr>`,
            )
            .join('');
        inner = `<table ${TABLE} align="${p.align}">${rows}</table>`;
    }
    return wrap(inner, p.padding, p.align, p);
};

const renderSpacer = (p: SpacerProperties): string =>
    `<div${visibilityClass(p)} style="height:${p.height}px;line-height:${p.height}px;font-size:0;${visibilityStyle(p)}">&nbsp;</div>`;

const renderTable = (p: TableProperties, ctx: Context): string => {
    const border = `${p.borderWidth}px solid ${rgbaToCss(p.borderColor)}`;
    const rows = p.rows
        .map((row, r) => {
            const isHeader = p.headerRow && r === 0;
            const striped =
                p.stripe && !isHeader && (p.headerRow ? r : r + 1) % 2 === 0;
            let bg = '';
            if (isHeader)
                bg = `background-color:${rgbaToCss(p.headerBackground)};`;
            else if (striped)
                bg = `background-color:${rgbaToCss(p.stripeColor)};`;
            const bgAttrValue = (() => {
                if (isHeader) return bgAttr(p.headerBackground);
                if (striped) return bgAttr(p.stripeColor);
                return '';
            })();
            const cells = row
                .map((cell) => {
                    const tag = isHeader ? 'th' : 'td';
                    const style = [
                        `border:${border}`,
                        `padding:${p.cellPadding}px`,
                        `font-family:${ctx.canvas.fontFamily}`,
                        `font-size:${p.fontSize}px`,
                        'text-align:left',
                        `font-weight:${isHeader ? 'bold' : 'normal'}`,
                        `color:${isHeader ? rgbaToCss(p.headerColor) : rgbaToCss(ctx.canvas.color)}`,
                        bg,
                    ]
                        .filter(Boolean)
                        .join(';');
                    return `<${tag}${bgAttrValue} style="${style};">${cell || '&nbsp;'}</${tag}>`;
                })
                .join('');
            return `<tr>${cells}</tr>`;
        })
        .join('');
    return wrap(
        `<table ${TABLE} width="${p.width}%" align="${p.align}" style="width:${p.width}%;border-collapse:collapse;">${rows}</table>`,
        p.padding,
        p.align,
        p,
    );
};

const shapeRadius = (
    shape: 'circle' | 'rounded' | 'square',
    size: number,
): number => {
    if (shape === 'circle') return size / 2;
    if (shape === 'rounded') return 6;
    return 0;
};

const renderIcons = (p: IconsProperties, ctx: Context): string => {
    const radius = shapeRadius(p.iconShape, p.iconSize);
    const iconFor = (icon: string, iconUrl: string) =>
        iconUrl
            ? `<img src="${escapeHtml(iconUrl)}" alt="" width="${p.iconSize}" height="${p.iconSize}" style="display:block;width:${p.iconSize}px;height:${p.iconSize}px;border-radius:${radius}px;border:0;" />`
            : `<table ${TABLE}><tr><td${bgAttr(p.iconBackground)} width="${p.iconSize}" height="${p.iconSize}" align="center" valign="middle" style="width:${p.iconSize}px;height:${p.iconSize}px;border-radius:${radius}px;background-color:${rgbaToCss(p.iconBackground)};color:${rgbaToCss(p.iconColor)};font-family:Arial,sans-serif;font-size:${Math.round(p.iconSize * 0.5)}px;line-height:${p.iconSize}px;text-align:center;">${escapeHtml(icon)}</td></tr></table>`;
    const textStyle = `font-family:${ctx.canvas.fontFamily};font-size:${p.fontSize}px;color:${rgbaToCss(ctx.canvas.color)};line-height:1.5`;

    if (p.layout === 'horizontal') {
        const width = Math.floor(100 / Math.max(1, p.items.length));
        const cells = p.items
            .map(
                (item) =>
                    `<td class="stack" width="${width}%" valign="top" align="center" style="width:${width}%;padding:0 ${p.gap / 2}px;text-align:center;${textStyle};"><table ${TABLE} align="center"><tr><td>${iconFor(item.icon, item.iconUrl)}</td></tr></table><div style="font-weight:${p.titleWeight};margin-top:8px;">${item.title}</div><div style="margin-top:2px;">${item.text}</div></td>`,
            )
            .join('');
        return wrap(
            `<table ${TABLE} width="100%"><tr>${cells}</tr></table>`,
            p.padding,
            p.align,
            p,
        );
    }

    const rows = p.items
        .map(
            (item, i) =>
                `<tr><td width="${p.iconSize}" valign="top" style="width:${p.iconSize}px;padding:${i === 0 ? 0 : p.gap}px 12px 0 0;">${iconFor(item.icon, item.iconUrl)}</td><td valign="top" style="padding:${i === 0 ? 0 : p.gap}px 0 0 0;text-align:${p.align};${textStyle};"><div style="font-weight:${p.titleWeight};">${item.title}</div><div style="margin-top:2px;">${item.text}</div></td></tr>`,
        )
        .join('');
    return wrap(
        `<table ${TABLE} width="100%">${rows}</table>`,
        p.padding,
        p.align,
        p,
    );
};

const renderProduct = (p: ProductProperties, ctx: Context): string => {
    const image = `<img src="${escapeHtml(p.image || PLACEHOLDER_IMAGE)}" alt="${escapeHtml(p.imageAlt)}" width="100%" style="display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:${p.border.radius}px;" />`;
    const text = `font-family:${ctx.canvas.fontFamily};color:${rgbaToCss(ctx.canvas.color)};`;
    const button = p.buttonText
        ? `<table ${TABLE} align="${p.layout === 'horizontal' ? 'left' : p.align}" style="margin-top:12px;"><tr><td${bgAttr(p.buttonBackground)} style="background-color:${rgbaToCss(p.buttonBackground)};border-radius:4px;"><a href="${escapeHtml(p.buttonHref)}" target="_blank" style="display:inline-block;padding:10px 20px;font-family:${ctx.canvas.fontFamily};font-size:${p.fontSize}px;font-weight:bold;color:${rgbaToCss(p.buttonColor)};text-decoration:none;border-radius:4px;">${escapeHtml(p.buttonText)}</a></td></tr></table>`
        : '';
    const details = `<div style="${text}font-size:${p.fontSize + 4}px;font-weight:bold;">${escapeHtml(p.title)}</div><div style="${text}font-size:${p.fontSize}px;line-height:1.5;margin-top:6px;">${escapeHtml(p.description)}</div><div style="${text}font-size:${p.fontSize + 2}px;margin-top:10px;">${p.oldPrice ? `<s style="opacity:0.6;margin-right:8px;">${escapeHtml(p.oldPrice)}</s>` : ''}<strong>${escapeHtml(p.price)}</strong></div>${button}`;
    const cardStyle = [
        isTransparent(p.backgroundColor)
            ? ''
            : `background-color:${rgbaToCss(p.backgroundColor)}`,
        `border:${borderCss(p.border)}`,
        `border-radius:${p.border.radius}px`,
    ]
        .filter(Boolean)
        .join(';');
    const inner =
        p.layout === 'horizontal'
            ? `<tr><td class="stack" width="${p.imageWidth}%" valign="top" style="width:${p.imageWidth}%;padding:12px;">${image}</td><td class="stack" valign="top" style="padding:12px;text-align:left;">${details}</td></tr>`
            : `<tr><td style="padding:12px;text-align:${p.align};">${image}<div style="height:12px;line-height:12px;font-size:0;">&nbsp;</div>${details}</td></tr>`;
    return wrap(
        `<table ${TABLE} width="100%"${bgAttr(p.backgroundColor)} style="${cardStyle};">${inner}</table>`,
        p.padding,
        'left',
        p,
    );
};

const starText = (rating: number): string => {
    const n = Math.max(0, Math.min(5, Math.round(rating)));
    return '&#9733;'.repeat(n) + '&#9734;'.repeat(5 - n);
};

const renderQuote = (p: QuoteProperties, ctx: Context): string => {
    const color = resolveColor(p.inheritColor, p.color, ctx);
    const accent = rgbaToCss(p.accentColor);
    const mark = (glyph: string, side: 'left' | 'right') =>
        p.showMarks
            ? `<span style="color:${accent};font-size:${Math.round(p.fontSize * 1.6)}px;line-height:0;vertical-align:-0.3em;${side === 'left' ? 'margin-right' : 'margin-left'}:4px;">${glyph}</span>`
            : '';
    const stars =
        p.rating > 0
            ? `<div style="color:#f59e0b;font-size:${p.fontSize}px;letter-spacing:2px;margin-bottom:8px;">${starText(p.rating)}</div>`
            : '';
    const avatar = p.avatar
        ? `<td width="36" valign="middle" style="width:36px;padding-right:10px;"><img src="${escapeHtml(p.avatar)}" alt="" width="36" height="36" style="display:block;width:36px;height:36px;border-radius:18px;border:0;" /></td>`
        : '';
    const byline =
        p.author || p.role
            ? `<table ${TABLE} align="${p.align}" style="margin-top:12px;"><tr>${avatar}<td valign="middle" style="font-family:${ctx.canvas.fontFamily};font-size:${p.fontSize - 2}px;color:${color};"><div style="font-weight:bold;">${escapeHtml(p.author)}</div>${p.role ? `<div style="opacity:0.7;">${escapeHtml(p.role)}</div>` : ''}</td></tr></table>`
            : '';
    const body = `<div style="font-family:${ctx.canvas.fontFamily};font-size:${p.fontSize}px;line-height:1.5;color:${color};font-style:${p.italic ? 'italic' : 'normal'};">${mark('&ldquo;', 'left')}${escapeHtml(p.text)}${mark('&rdquo;', 'right')}</div>`;
    return wrap(
        `<table ${TABLE} width="100%"${bgAttr(p.backgroundColor)} style="background-color:${rgbaToCss(p.backgroundColor)};border-left:4px solid ${accent};"><tr><td style="padding:16px 20px;text-align:${p.align};">${stars}${body}${byline}</td></tr></table>`,
        p.padding,
        'left',
        p,
    );
};

const renderCoupon = (p: CouponProperties, ctx: Context): string => {
    const font = `font-family:${ctx.canvas.fontFamily};color:${rgbaToCss(ctx.canvas.color)};`;
    const label = p.label
        ? `<div style="${font}font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:0.75;">${escapeHtml(p.label)}</div>`
        : '';
    const description = p.description
        ? `<div style="${font}font-size:13px;opacity:0.8;margin-top:8px;">${escapeHtml(p.description)}</div>`
        : '';
    const code = `<table ${TABLE} align="${p.align}" style="margin-top:8px;"><tr><td${bgAttr(p.codeBackground)} style="background-color:${rgbaToCss(p.codeBackground)};border-radius:6px;padding:8px 18px;font-family:'Courier New',Courier,monospace;font-size:${p.codeSize}px;font-weight:bold;letter-spacing:3px;color:${rgbaToCss(p.codeColor)};">${escapeHtml(p.code)}</td></tr></table>`;
    return wrap(
        `<table ${TABLE} width="100%"${bgAttr(p.backgroundColor)} style="background-color:${rgbaToCss(p.backgroundColor)};border:2px dashed ${rgbaToCss(p.borderColor)};border-radius:8px;"><tr><td style="padding:18px 20px;text-align:${p.align};">${label}${code}${description}</td></tr></table>`,
        p.padding,
        'left',
        p,
    );
};

const renderCallout = (p: CalloutProperties, ctx: Context): string => {
    const font = `font-family:${ctx.canvas.fontFamily};font-size:${p.fontSize}px;line-height:1.5;color:${rgbaToCss(p.color)};`;
    const icon = p.icon
        ? `<td valign="top" width="28" style="width:28px;padding:14px 0 14px 16px;font-size:${p.fontSize + 6}px;line-height:1.2;">${escapeHtml(p.icon)}</td>`
        : '';
    const title = p.title
        ? `<div style="font-weight:bold;margin-bottom:2px;">${escapeHtml(p.title)}</div>`
        : '';
    return wrap(
        `<table ${TABLE} width="100%"${bgAttr(p.backgroundColor)} style="background-color:${rgbaToCss(p.backgroundColor)};border-left:4px solid ${rgbaToCss(p.accentColor)};border-radius:${p.radius}px;"><tr>${icon}<td valign="top" style="padding:14px 16px;${font}">${title}<div>${escapeHtml(p.text)}</div></td></tr></table>`,
        p.padding,
        'left',
        p,
    );
};

const renderFooter = (p: FooterProperties, ctx: Context): string => {
    const font = `font-family:${ctx.canvas.fontFamily};font-size:${p.fontSize}px;line-height:1.6;color:${rgbaToCss(p.color)};`;
    const link = `color:${rgbaToCss(p.linkColor)};text-decoration:underline;`;
    const links = [
        p.unsubscribeText
            ? `<a href="${escapeHtml(p.unsubscribeHref)}" style="${link}">${escapeHtml(p.unsubscribeText)}</a>`
            : '',
        p.preferencesText
            ? `<a href="${escapeHtml(p.preferencesHref)}" style="${link}">${escapeHtml(p.preferencesText)}</a>`
            : '',
    ]
        .filter(Boolean)
        .join(' &middot; ');
    const lines = [
        p.company
            ? `<div style="font-weight:bold;">${escapeHtml(p.company)}</div>`
            : '',
        p.address ? `<div>${escapeHtml(p.address)}</div>` : '',
        p.text
            ? `<div style="margin-top:6px;">${escapeHtml(p.text)}</div>`
            : '',
        links ? `<div style="margin-top:6px;">${links}</div>` : '',
    ].join('');
    const cls = darkTextClass(rgbaToCss(p.color));
    return wrap(`<div${cls ? ` class="${cls}"` : ''} style="${font}">${lines}</div>`, p.padding, p.align, p);
};

export const renderContent = (node: EmailNode, ctx: Context): string => {
    switch (node.type) {
        case 'Heading':
            return renderHeading(node.properties, ctx);
        case 'Text':
            return renderText(node.properties, ctx);
        case 'Divider':
            return renderDivider(node.properties);
        case 'Button':
            return renderButton(node.properties, ctx);
        case 'List':
            return renderList(node.properties, ctx);
        case 'Image':
            return renderImage(node.properties, ctx);
        case 'Video':
            return renderVideo(node.properties, ctx);
        case 'Social':
            return renderSocial(node.properties);
        case 'HTML':
            return renderHtml(node.properties);
        case 'Menu':
            return renderMenu(node.properties, ctx);
        case 'Spacer':
            return renderSpacer(node.properties);
        case 'Table':
            return renderTable(node.properties, ctx);
        case 'Icons':
            return renderIcons(node.properties, ctx);
        case 'Product':
            return renderProduct(node.properties, ctx);
        case 'Quote':
            return renderQuote(node.properties, ctx);
        case 'Coupon':
            return renderCoupon(node.properties, ctx);
        case 'Callout':
            return renderCallout(node.properties, ctx);
        case 'Footer':
            return renderFooter(node.properties, ctx);
        default:
            return '';
    }
};

const renderColumn = (
    column: ColumnNode,
    row: RowNode,
    ctx: Context,
): string => {
    const p = column.properties;
    const classes = [row.properties.stack ? 'stack' : '', lightBgClass(p.backgroundColor, 'mw-cbg-light')].filter(Boolean);
    const stackClass = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
    const style = [
        `width:${p.width}%`,
        `padding:${paddingCss(p.padding)}`,
        `border:${borderCss(p.border)}`,
        `border-radius:${p.border.radius}px`,
        `vertical-align:${p.verticalAlign}`,
    ].join(';');
    const content = column.children
        .map((child) => renderContent(child, ctx))
        .join('\n');
    return `<td${stackClass} width="${p.width}%" valign="${p.verticalAlign}"${bgAttr(p.backgroundColor)} style="${style};">${content}</td>`;
};

const renderRow = (row: RowNode, ctx: Context): string => {
    const p = row.properties;
    const w = ctx.contentWidth;
    const outerStyle = [
        isTransparent(p.backgroundColor)
            ? ''
            : `background-color:${rgbaToCss(p.backgroundColor)}`,
        p.backgroundImage
            ? `background-image:url('${escapeHtml(p.backgroundImage)}');background-size:cover;background-position:center`
            : '',
    ]
        .filter(Boolean)
        .join(';');
    const innerStyle = [
        'width:100%',
        `max-width:${w}px`,
        isTransparent(p.contentBackgroundColor)
            ? ''
            : `background-color:${rgbaToCss(p.contentBackgroundColor)}`,
    ]
        .filter(Boolean)
        .join(';');
    const columns = row.children
        .map((column) => renderColumn(column as ColumnNode, row, ctx))
        .join('\n');
    const bgImage = p.backgroundImage
        ? ` background="${escapeHtml(p.backgroundImage)}"`
        : '';

    return [
        `<table ${TABLE} width="100%"${visibilityClass(p, lightBgClass(p.backgroundColor, 'mw-row-light'))}${bgAttr(p.backgroundColor)}${bgImage} style="${outerStyle};${visibilityStyle(p)}">`,
        `<tr><td align="${p.contentAlign}" style="padding:${paddingCss(p.padding)};">`,
        `<!--[if mso]><table ${TABLE} width="${w}" align="${p.contentAlign}"><tr><td><![endif]-->`,
        `<table ${TABLE} width="100%"${bgAttr(p.contentBackgroundColor)} class="container${isTransparent(p.contentBackgroundColor) || !isLightColor(p.contentBackgroundColor) ? '' : ' mw-cbg-light'}" style="${innerStyle};"><tr>`,
        columns,
        '</tr></table>',
        '<!--[if mso]></td></tr></table><![endif]-->',
        '</td></tr></table>',
    ].join('\n');
};

/** Every font-family value used by the document. */
const collectFonts = (root: CanvasNode): string[] => {
    const values = new Set<string>([root.properties.fontFamily]);
    const walk = (node: EmailNode) => {
        const font = node.properties?.fontFamily;
        if (typeof font === 'string' && font !== 'inherit') values.add(font);
        node.children.forEach(walk);
    };
    walk(root);
    return [...values];
};

export interface ExportOptions {
    /** Collapse whitespace between tags. */
    minify?: boolean;
}

const minifyHtml = (html: string): string =>
    html
        .replace(/<!--(?!\[if)(?!<!)[\s\S]*?-->/g, '')
        .replace(/\n\s*/g, '')
        .replace(/>\s{2,}</g, '> <');

/** Designed dark theme for clients that honour prefers-color-scheme, plus Outlook.com's data-ogsc/data-ogsb hooks. */
const darkModeCss = (canvas: CanvasProperties): string => {
    const link = rgbaToCss(lighten(canvas.linkColor, 0.35));
    // [selectors, declarations]; selectors are prefixed one by one for the Outlook.com variants.
    const rules: [string[], string][] = [
        [['body', '.mw-page'], 'background-color: #0b0d12 !important;'],
        [['.mw-row-light'], 'background-color: #12151c !important;'],
        [['.mw-cbg-light'], 'background-color: #1a1e27 !important;'],
        [['.mw-text-dark', '.mw-text-dark *'], 'color: #e6e8ee !important;'],
        [['.mw-text-dark a'], `color: ${link} !important;`],
        [['.mw-line-light'], 'border-top-color: #3a3f4b !important;'],
    ];
    const rule = (selectors: string[], declarations: string, prefix = '') =>
        `${selectors.map((sel) => (prefix ? `${prefix} ${sel}` : sel)).join(', ')} { ${declarations} }`;
    return [
        '@media (prefers-color-scheme: dark) {',
        ...rules.map(([sel, decl]) => `  ${rule(sel, decl)}`),
        '}',
        // Outlook.com and the new Outlook apps expose dark mode through these attributes.
        ...rules.map(([sel, decl]) => rule(sel, decl, '[data-ogsc]')),
        ...rules.map(([sel, decl]) => rule(sel, decl, '[data-ogsb]')),
    ].join('\n');
};

/** Renders the whole document as email-client-friendly HTML. */
export const exportHtml = (
    root: CanvasNode,
    options: ExportOptions = {},
): string => {
    const canvas = root.properties;
    const ctx: Context = { canvas, contentWidth: canvas.contentWidth };
    const rows = root.children
        .map((row) => renderRow(row as RowNode, ctx))
        .join('\n');
    const bg = rgbaToCss(canvas.backgroundColor);
    const preheader = canvas.preheaderText
        ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(canvas.preheaderText)}${'&#847;&zwnj;&nbsp;'.repeat(30)}</div>`
        : '';
    const contentBg = isTransparent(canvas.contentBackgroundColor)
        ? ''
        : `background-color:${rgbaToCss(canvas.contentBackgroundColor)};`;

    // Web fonts are progressive enhancement: linked for clients that support
    // them (Apple Mail, iOS, some Android), hidden from Outlook via the MSO
    // conditional so it falls back to the stack's system font.
    const fonts = googleFamiliesFor(collectFonts(root));
    const fontLinks =
        fonts.length > 0
            ? `<!--[if !mso]><!--><link href="${googleFontsUrl(fonts)}" rel="stylesheet" type="text/css" /><style>@import url('${googleFontsUrl(fonts)}');</style><!--<![endif]-->`
            : '';

    const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>${escapeHtml(canvas.title)}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
${fontLinks}
<style>
:root { color-scheme: light dark; supported-color-schemes: light dark; }
html, body { margin: 0 !important; padding: 0 !important; height: 100% !important; width: 100% !important; }
* { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-collapse: collapse !important; }
img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
a { color: ${rgbaToCss(canvas.linkColor)}; }
a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
.container { ${contentBg} }
@media only screen and (max-width: ${canvas.contentWidth + 20}px) {
  .container { width: 100% !important; max-width: 100% !important; }
  .stack { display: block !important; width: 100% !important; box-sizing: border-box !important; }
  .hide-mobile { display: none !important; max-height: 0 !important; overflow: hidden !important; }
  .hide-desktop { display: table !important; max-height: none !important; overflow: visible !important; }
  div.hide-desktop { display: block !important; }
}
${darkModeCss(canvas)}
</style>
</head>
<body style="margin:0;padding:0;background-color:${bg};font-family:${canvas.fontFamily};color:${rgbaToCss(canvas.color)};">
${preheader}
<table ${TABLE} width="100%" bgcolor="${bg}" class="mw-page" style="background-color:${bg};">
<tr><td>
${rows}
</td></tr>
</table>
</body>
</html>`;

    return options.minify ? minifyHtml(html) : html;
};

export const exportJson = (root: CanvasNode, name: string): string =>
    JSON.stringify(
        {
            version: 1,
            name,
            updatedAt: new Date().toISOString(),
            root,
        },
        null,
        2,
    );

/**
 * Pins an export to one colour scheme for previews and thumbnails. Inboxes
 * decide for themselves, but an iframe in the editor follows the viewer's
 * operating system, so "light" must not depend on it.
 */
export const forceColorScheme = (html: string, scheme: 'light' | 'dark'): string => {
    if (scheme === 'dark') {
        return html.replace(/@media \(prefers-color-scheme: dark\)/g, '@media all');
    }
    return html
        .replace(/@media \(prefers-color-scheme: dark\)/g, '@media not all')
        .replace(/color-scheme: light dark;/g, 'color-scheme: light;')
        .replace(/supported-color-schemes: light dark;/g, 'supported-color-schemes: light;')
        .replace(/content="light dark"/g, 'content="light"');
};
