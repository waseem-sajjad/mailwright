import type { CanvasNode, EmailNode } from '@/types';

import { MERGE_TAG_RE } from './mergeTags';

export type IssueLevel = 'error' | 'warning';

export interface Issue {
    level: IssueLevel;
    message: string;
    /** Node to select when the issue is clicked; omitted for document-wide. */
    nodeId?: string;
}

const isPlaceholderUrl = (href: string): boolean => {
    const value = href.trim();
    return (
        value === '' ||
        value === '#' ||
        value === 'https://' ||
        value === 'http://' ||
        value === 'https://example.com' ||
        value.startsWith('https://example.com/')
    );
};

const walk = (node: EmailNode, visit: (n: EmailNode) => void) => {
    visit(node);
    node.children.forEach((child) => walk(child, visit));
};

/** Pre-flight checks run before export. Returns errors first. */
export const checkDocument = (root: CanvasNode): Issue[] => {
    const issues: Issue[] = [];
    const push = (level: IssueLevel, message: string, nodeId?: string) =>
        issues.push({ level, message, nodeId });

    const canvas = root.properties;
    if (!canvas.title.trim() || canvas.title === 'Untitled email') {
        push('warning', 'Email title is still the default.', root.id);
    }
    if (!canvas.preheaderText.trim()) {
        push('warning', 'No preheader text set.', root.id);
    }
    if (root.children.length === 0) {
        push('error', 'The email has no rows.');
    }

    let text = '';
    const knownTags = new Set(canvas.mergeTags.map((t) => t.tag));

    walk(root, (node) => {
        const p = node.properties;
        switch (node.type) {
            case 'Column':
                if (node.children.length === 0) {
                    push('warning', 'Empty column.', node.id);
                }
                break;
            case 'Image':
                if (!p.src) push('error', 'Image has no URL.', node.id);
                else if (String(p.src).startsWith('data:')) {
                    push(
                        'error',
                        'Image is embedded (data URI). Host it and use the URL; most inboxes block embedded images.',
                        node.id,
                    );
                }
                if (!String(p.alt).trim()) {
                    push('warning', 'Image has no alt text.', node.id);
                }
                if (p.href && isPlaceholderUrl(p.href)) {
                    push('warning', 'Image link is a placeholder.', node.id);
                }
                break;
            case 'Button':
                if (isPlaceholderUrl(p.href)) {
                    push(
                        'error',
                        `Button "${p.text}" has a placeholder link.`,
                        node.id,
                    );
                }
                if (!String(p.text).trim()) {
                    push('warning', 'Button has no label.', node.id);
                }
                break;
            case 'Video':
                if (isPlaceholderUrl(p.url)) {
                    push('error', 'Video has a placeholder URL.', node.id);
                }
                break;
            case 'Menu':
                p.items.forEach((item: { text: string; href: string }) => {
                    if (isPlaceholderUrl(item.href)) {
                        push(
                            'warning',
                            `Menu link "${item.text}" is a placeholder.`,
                            node.id,
                        );
                    }
                });
                break;
            case 'Social':
                p.items.forEach((item: { network: string; href: string }) => {
                    if (isPlaceholderUrl(item.href)) {
                        push(
                            'warning',
                            `Social link for ${item.network} is a placeholder.`,
                            node.id,
                        );
                    }
                });
                break;
            case 'Product':
                if (isPlaceholderUrl(p.buttonHref) && p.buttonText) {
                    push(
                        'error',
                        `Product "${p.title}" button has a placeholder link.`,
                        node.id,
                    );
                }
                if (!p.image)
                    push(
                        'warning',
                        `Product "${p.title}" has no image.`,
                        node.id,
                    );
                else if (String(p.image).startsWith('data:')) {
                    push(
                        'error',
                        'Product image is embedded (data URI). Host it and use the URL.',
                        node.id,
                    );
                }
                break;
            case 'Footer':
                if (!String(p.address).trim()) {
                    push(
                        'warning',
                        'Footer has no postal address; most spam laws require one.',
                        node.id,
                    );
                }
                if (p.unsubscribeText && isPlaceholderUrl(p.unsubscribeHref)) {
                    push(
                        'error',
                        'Footer unsubscribe link is a placeholder.',
                        node.id,
                    );
                }
                if (p.preferencesText && isPlaceholderUrl(p.preferencesHref)) {
                    push(
                        'warning',
                        'Footer preferences link is a placeholder.',
                        node.id,
                    );
                }
                break;
            case 'Icons':
                p.items.forEach((item: { iconUrl: string; title: string }) => {
                    if (String(item.iconUrl).startsWith('data:')) {
                        push(
                            'error',
                            `Icon for "${item.title}" is embedded (data URI).`,
                            node.id,
                        );
                    }
                });
                break;
            case 'Table':
                if (p.rows.length === 0 || p.rows[0].length === 0) {
                    push('warning', 'Table is empty.', node.id);
                }
                break;
            case 'HTML':
                if (/<script[\s>]/i.test(p.html)) {
                    push(
                        'error',
                        'HTML block contains a <script> tag; email clients strip scripts.',
                        node.id,
                    );
                }
                break;
            case 'Heading':
            case 'Text':
                if (
                    !String(p.text)
                        .replace(/<[^>]+>/g, '')
                        .trim()
                ) {
                    push('warning', `${node.type} block is empty.`, node.id);
                }
                break;
            default:
                break;
        }

        // Only block content counts; canvas settings hold the tag definitions.
        if (node.type !== 'Canvas') text += ` ${JSON.stringify(p)}`;

        if (
            node.type !== 'Canvas' &&
            node.type !== 'Column' &&
            p.hideOnMobile &&
            p.hideOnDesktop
        ) {
            push('warning', `${node.type} is hidden on every device.`, node.id);
        }
    });

    for (const match of text.matchAll(MERGE_TAG_RE)) {
        if (!knownTags.has(match[1])) {
            push(
                'warning',
                `Merge tag {{${match[1]}}} is not defined in Body settings.`,
            );
        }
    }
    if (!/unsubscribe/i.test(text)) {
        push(
            'warning',
            'No unsubscribe link or text found. Most jurisdictions require one.',
        );
    }

    return issues.sort((a, b) => {
        if (a.level === b.level) return 0;
        return a.level === 'error' ? -1 : 1;
    });
};
