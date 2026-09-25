import type {
    Align,
    ButtonProperties,
    CanvasNode,
    CanvasProperties,
    ColumnNode,
    DividerProperties,
    EmailNode,
    HeadingProperties,
    HtmlProperties,
    ImageProperties,
    ListProperties,
    MenuProperties,
    RowNode,
    SocialProperties,
    SpacerProperties,
    TextProperties,
    VideoProperties,
    Visibility,
} from '@/types';

import {
    borderCss,
    escapeHtml,
    isTransparent,
    paddingCss,
    rgbaToCss,
    videoThumbnail,
} from './helper';
import { PLACEHOLDER_IMAGE, SOCIAL_NETWORKS } from './factory';

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
const visibilityClass = (p: Visibility): string => {
    const classes: string[] = [];
    if (p.hideOnMobile) classes.push('hide-mobile');
    if (p.hideOnDesktop) classes.push('hide-desktop');
    return classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
};

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
    return wrap(
        `<${p.level} style="${style};">${p.text}</${p.level}>`,
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
    return wrap(
        `<div style="${style};">${p.text}</div>`,
        p.padding,
        p.align,
        p,
    );
};

const renderDivider = (p: DividerProperties): string =>
    wrap(
        `<table ${TABLE} width="${p.width}%" align="${p.align}" style="width:${p.width}%;"><tr><td style="border-top:${p.thickness}px ${p.style} ${rgbaToCss(p.color)};font-size:0;line-height:0;">&nbsp;</td></tr></table>`,
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
    return wrap(
        `<${tag} style="${style};">${items}</${tag}>`,
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
    const stackClass = row.properties.stack ? ' class="stack"' : '';
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
        `<table ${TABLE} width="100%"${visibilityClass(p)}${bgAttr(p.backgroundColor)}${bgImage} style="${outerStyle};${visibilityStyle(p)}">`,
        `<tr><td align="${p.contentAlign}" style="padding:${paddingCss(p.padding)};">`,
        `<!--[if mso]><table ${TABLE} width="${w}" align="${p.contentAlign}"><tr><td><![endif]-->`,
        `<table ${TABLE} width="100%"${bgAttr(p.contentBackgroundColor)} class="container" style="${innerStyle};"><tr>`,
        columns,
        '</tr></table>',
        '<!--[if mso]></td></tr></table><![endif]-->',
        '</td></tr></table>',
    ].join('\n');
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

    const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="x-apple-disable-message-reformatting" />
<title>${escapeHtml(canvas.title)}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style>
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
</style>
</head>
<body style="margin:0;padding:0;background-color:${bg};font-family:${canvas.fontFamily};color:${rgbaToCss(canvas.color)};">
${preheader}
<table ${TABLE} width="100%" bgcolor="${bg}" style="background-color:${bg};">
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
