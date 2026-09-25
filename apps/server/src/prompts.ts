/**
 * Prompt formats shared by the dataset builder and the Python service. Keep
 * these in sync with ai/serve.py, ai/train.py and ai/codec.py.
 */
export const GENERATE_PREFIX = 'Generate an email template.\nRequest: ';

export const REFINE_PREFIX = (dsl: string, instruction: string): string =>
    `Edit an email template.\nCurrent:\n${dsl}\nInstruction: ${instruction}`;

/**
 * T5's SentencePiece vocabulary has no newline, "{" or "}" tokens: they are
 * silently dropped, which flattens the DSL into one line and turns
 * "{{first_name}}" into "first_name". Text crossing the model boundary uses
 * sentinels the tokenizer can see instead. Mirrored in ai/codec.py.
 */
export const NEWLINE_TOKEN = ' @@ ';

export const encodeForModel = (text: string): string =>
    text.replace(/\{\{/g, '[[').replace(/\}\}/g, ']]').replace(/\r?\n/g, NEWLINE_TOKEN);

export const decodeFromModel = (text: string): string =>
    text
        .replace(/\s*@@\s*/g, '\n')
        .replace(/\[\[\s*/g, '{{')
        .replace(/\s*\]\]/g, '}}')
        .trim();

/** Merge tags that are unambiguous even without braces. */
const BARE_TAGS = ['first_name', 'last_name', 'unsubscribe_url'];
const bareTag = new RegExp(`(?<![\\w{\\[])(${BARE_TAGS.join('|')})(?![\\w}\\]])`, 'g');

/**
 * Makes a model answer parseable: decodes the sentinels and, for checkpoints
 * trained before the codec existed, re-inserts the line breaks before the
 * header keys and row headers and restores the braces around merge tags.
 */
export const repairDsl = (text: string): string => {
    let out = decodeFromModel(text);
    if (!out.includes('\n')) {
        // Only break outside quoted copy: `text "front row: best seats"` stays.
        const outsideQuotes = (offset: number): boolean =>
            (out.slice(0, offset).match(/"/g)?.length ?? 0) % 2 === 0;
        out = out.replace(
            /\s+(?=(?:preheader|brand|bg|row(?:\s+(?:\d[\d-]*|light|dark|brand))*)\s*:)/gi,
            (match, offset: number) => (outsideQuotes(offset) ? '\n' : match),
        );
    }
    return out.replace(bareTag, '{{$1}}');
};
