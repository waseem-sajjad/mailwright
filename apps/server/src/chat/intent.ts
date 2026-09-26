/**
 * What a chat message asks for. Kept as plain functions so the rules are
 * easy to test and to extend.
 */
export type Intent =
    | { kind: 'search'; query: string }
    | { kind: 'subjects' }
    | { kind: 'refine' }
    | { kind: 'generate' };

/** "find templates about coffee", "search the library for sales", "show me saved templates". */
export const librarySearch = (text: string): string | null => {
    const trimmed = text.trim();
    if (
        !/^(find|search|show( me)?|look( up| for)?|list|any)\b/i.test(trimmed) ||
        !/\b(templates?|library|saved)\b/i.test(trimmed)
    ) {
        return null;
    }
    return trimmed
        .replace(/^(find|search( for)?|show( me)?|look( up| for)?|list|any)\s+/i, '')
        .replace(/\b(me|some|all|the|my|our)\b\s*/gi, '')
        .replace(/\b(in|from)\s+(the\s+|my\s+)?library\b/gi, '')
        .replace(/\b(saved\s+)?templates?\b/gi, '')
        .replace(/\b(about|for|like|similar to|on)\b/i, '')
        .trim();
};

export const wantsSubjects = (text: string): boolean =>
    /\b(subject( line)?s?|preheaders?)\b/i.test(text) &&
    /\b(suggest|ideas?|give|write|options|some|what|need)\b/i.test(text);

export const isRefinement = (text: string): boolean =>
    /^(make|change|set|add|insert|remove|delete|drop|use|switch|turn|replace|shorten|shorter|more|less|without|update|rename|put)\b/i.test(
        text.trim(),
    ) || /\b(it|this|the (header|hero|button|heading|title|coupon|footer|tone|colou?r))\b/i.test(text);

export const classify = (text: string, hasContext: boolean): Intent => {
    const query = librarySearch(text);
    if (query !== null) return { kind: 'search', query };
    if (wantsSubjects(text)) return { kind: 'subjects' };
    if (hasContext && isRefinement(text)) return { kind: 'refine' };
    return { kind: 'generate' };
};
