/**
 * Prompts for Gemini. The model writes the compact template DSL from
 * `dsl.ts`; the grammar below and one rules-engine example keep it on format.
 */
import { generateDsl, type GenerateOptions } from './generator.ts';

export const SYSTEM_INSTRUCTION = `You are an email designer. You answer ONLY with an email template written in the compact DSL below: no markdown fences, no explanations, no blank lines.

FORMAT (one statement per line, in this order):
title: <email title, also used as the subject>
preheader: <one short preview sentence>
brand: <brand colour as a 6-digit hex, e.g. #2563eb>
bg: <page background as a 6-digit hex, usually #f2f2f2 or #ffffff>
row [layout] [style]: <column> | <column> | ...

ROWS
- layout (optional): 1 (default, one column), 2, 3, 4, 1-2, 2-1, 1-2-1. The number of columns after the colon, separated by " | ", must match the layout (2 → 2 columns, 1-2 → 2 columns, 1-2-1 → 3 columns).
- style (optional): light (grey band), dark (dark band, white text), brand (brand-coloured band). Omit for a plain white row.
- A column is one or more blocks separated by "; ".

BLOCKS (arguments in double quotes, URLs unquoted after the arguments)
  heading "Text"
  text "A paragraph. Merge tags such as {{first_name}} are allowed."
  button "Label" https://example.com
  image "Alt text" https://example.com/image.jpg   (the URL is optional)
  divider
  spacer 24
  list "First item" "Second item" "Third item"
  menu "Home" "Products" "Contact"
  social
  footer "Company name" "Postal address line"
  icons "🚀 Title|Short description" "✓ Title|Short description" "★ Title|Short description"
  product "Product name" "$19.00" "$29.00" https://example.com/product.jpg   (price, optional old price, optional image)
  quote "Quote text" "Author" "Role"
  coupon "SAVE20" "Use code at checkout" "Valid until Sunday"
  callout "Title" "Text"
  table "Column A,Column B" "cell,cell" "cell,cell"
  video https://www.youtube.com/watch?v=VIDEO_ID

RULES
- 5 to 9 rows. Start with a header row (dark or brand style: heading with the company name; menu). Finish with: row light: social; footer "Company" "Address".
- Put the main message in the first plain row: heading, text, button. Use one clear call to action; repeat the button near the end.
- Keep copy concrete and on brief: real product names, offers and dates from the request. Address the reader with {{first_name}}.
- Never use a double quote inside an argument; use a single quote instead. Never invent keys other than title, preheader, brand, bg, row.
- Every row must contain at least one block. Output plain text only.`;

/** A rules-engine document so the model sees the exact format once. */
export const EXAMPLE_DSL = generateDsl(
    'Welcome email for Bluebird Coffee, a friendly neighbourhood cafe.',
    { type: 'welcome', tone: 'friendly', company: 'Bluebird Coffee', seed: 11 },
);

const hints = (options: GenerateOptions): string[] => {
    const out: string[] = [];
    if (options.type && options.type !== 'auto') out.push(`Email type: ${options.type}.`);
    if (options.tone && options.tone !== 'auto') out.push(`Tone: ${options.tone}.`);
    if (options.company) out.push(`Company: ${options.company}.`);
    if (options.brand) out.push(`Brand colour: ${options.brand}.`);
    return out;
};

const historyBlock = (history: string[], label: string): string =>
    history.length > 0 ? `\n\n${label}\n${history.map((h) => `- ${h}`).join('\n')}` : '';

export const generatePrompt = (
    prompt: string,
    options: GenerateOptions,
    history: string[],
): string =>
    [
        `EXAMPLE OF THE FORMAT (different brief, do not copy its content):\n${EXAMPLE_DSL}`,
        `\n\nREQUEST\n${prompt}`,
        hints(options).length > 0 ? `\n${hints(options).join(' ')}` : '',
        historyBlock(history, 'Earlier requests in this conversation (context only, the new request wins):'),
        '\n\nWrite the template now.',
    ].join('');

export const refinePrompt = (
    prompt: string,
    dsl: string,
    instruction: string,
    history: string[],
): string =>
    [
        `ORIGINAL BRIEF\n${prompt}`,
        `\n\nCURRENT TEMPLATE\n${dsl}`,
        historyBlock(history, 'Changes already applied:'),
        `\n\nINSTRUCTION\n${instruction}`,
        '\n\nApply the instruction and return the complete updated template. Keep everything the instruction does not mention.',
    ].join('');

export const subjectsPrompt = (prompt: string, options: GenerateOptions, history: string[]): string =>
    [
        `Write 5 subject lines (under 50 characters, no emoji spam) and 3 preheaders (under 90 characters) for this email.`,
        `\n\nBRIEF\n${prompt}`,
        hints(options).length > 0 ? `\n${hints(options).join(' ')}` : '',
        historyBlock(history, 'Conversation so far:'),
    ].join('');

/** Strips markdown fences or a leading language tag the model may add. */
export const cleanDsl = (text: string): string =>
    text
        .replace(/^\s*```[a-z]*\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .replace(/^\s*dsl\s*\n/i, '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .join('\n');
