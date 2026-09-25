import type { MergeTag } from '@/types';

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
