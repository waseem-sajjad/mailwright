import type { MergeTag } from '@/types';

import { escapeHtml } from './helper';

/** Matches `{{ tag_name }}` with optional whitespace. */
export const MERGE_TAG_RE = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export const formatTag = (tag: string): string => `{{${tag}}}`;

/** Replaces every merge tag with its sample value (used by the preview). */
export const applyMergeTags = (html: string, tags: MergeTag[]): string => {
    const lookup = new Map(tags.map((t) => [t.tag, t.sample]));
    return html.replace(MERGE_TAG_RE, (match, name: string) =>
        lookup.has(name) ? String(lookup.get(name)) : match,
    );
};

/** Tags used in the HTML that are not defined on the document. */
export const unknownTags = (html: string, tags: MergeTag[]): string[] => {
    const known = new Set(tags.map((t) => t.tag));
    const found = new Set<string>();
    for (const match of html.matchAll(MERGE_TAG_RE)) {
        if (!known.has(match[1])) found.add(match[1]);
    }
    return [...found];
};

/** Zero-width space used to keep the caret placeable after a chip. */
export const ZWSP = '\u200B';

export const tagLabel = (tag: string, tags: MergeTag[]): string =>
    tags.find((t) => t.tag === tag)?.label || formatTag(tag);

export const isKnownTag = (tag: string, tags: MergeTag[]): boolean =>
    tags.some((t) => t.tag === tag);

/** Markup for one editor-only merge-tag chip. Never reaches the export. */
export const mergeTagChip = (tag: string, tags: MergeTag[]): string => {
    const known = isKnownTag(tag, tags);
    return `<span class="merge-tag${known ? '' : ' merge-tag--unknown'}" data-merge-tag="${escapeHtml(tag)}" contenteditable="false" title="${escapeHtml(formatTag(tag))}">${escapeHtml(tagLabel(tag, tags))}</span>`;
};

const CHIP_RE = /<span[^>]*\bdata-merge-tag="([^"]+)"[^>]*>[\s\S]*?<\/span>/g;

/** Turns chips back into plain `{{tag}}` text and drops caret helpers. */
export const undecorateTags = (html: string): string =>
    html
        .replace(CHIP_RE, (_, tag: string) => formatTag(tag))
        .split(ZWSP)
        .join('');

/**
 * Wraps every `{{tag}}` that sits in text (not inside an HTML tag) with a
 * chip. Idempotent: existing chips are unwrapped first.
 */
export const decorateTags = (html: string, tags: MergeTag[]): string =>
    undecorateTags(html)
        .split(/(<[^>]+>)/)
        .map((segment) =>
            segment.startsWith('<')
                ? segment
                : segment.replace(MERGE_TAG_RE, (_, tag: string) =>
                      mergeTagChip(tag, tags),
                  ),
        )
        .join('');
