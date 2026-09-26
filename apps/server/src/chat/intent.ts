/**
 * Heuristic intent detection, used when Gemini is not configured (Gemini
 * routes messages itself otherwise). Plain functions: easy to test and extend.
 */
export type IntentKind = 'generate' | 'refine' | 'subjects' | 'search' | 'answer';

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

/** A question with no email keywords wants an answer, not a template. */
export const isQuestion = (text: string): boolean =>
    /\?\s*$/.test(text) && !/\b(email|template|newsletter|campaign|promo|invite|announcement|receipt)\b/i.test(text);

export const classify = (text: string, hasContext: boolean): { kind: IntentKind; query: string } => {
    const query = librarySearch(text);
    if (query !== null) return { kind: 'search', query };
    if (wantsSubjects(text)) return { kind: 'subjects', query: '' };
    if (hasContext && isRefinement(text)) return { kind: 'refine', query: '' };
    if (isQuestion(text)) return { kind: 'answer', query: '' };
    return { kind: 'generate', query: '' };
};
