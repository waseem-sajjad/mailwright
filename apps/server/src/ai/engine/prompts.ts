/**
 * Prompts for Gemini. The model works as a senior email designer and
 * copywriter and answers with structured JSON: the template in the compact
 * DSL from `dsl.ts` plus a short professional rationale.
 */
import { Type, type Schema } from '@google/genai';

import { generateDsl, type GenerateOptions } from './generator';

const DSL_GRAMMAR = `DSL FORMAT (one statement per line, in this order; no blank lines, no other keys):
title: <email title, also used as the subject>
preheader: <one preview sentence, 40 to 90 characters, complements the title>
brand: <brand colour, 6-digit hex>
bg: <page background, 6-digit hex: #f2f2f2 for a light canvas, #ffffff for a white one>
row [layout] [style]: <column> | <column> | ...

ROWS
- layout (optional): 1 (default), 2, 3, 4, 1-2, 2-1, 1-2-1. The number of columns after the colon, separated by " | ", must match the layout (2 → 2 columns, 1-2 → 2 columns, 1-2-1 → 3 columns).
- style (optional): light (soft grey band), dark (dark band, white text), brand (brand-coloured band, white text). Omit for a plain white row.
- A column holds one or more blocks separated by "; ".

BLOCKS (arguments in double quotes; URLs unquoted after the arguments)
  heading "Text"
  text "A paragraph. Merge tags such as {{first_name}} are allowed."
  button "Label" https://example.com
  image "Alt text" https://example.com/image.jpg   (URL optional; always write meaningful alt text)
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

HARD RULES
- Start with a header row (dark or brand style): heading with the company name; menu with 2 to 4 links.
- End with: row light: social; footer "Company" "Postal address".
- Every row contains at least one block. Never use a double quote inside an argument (use a single quote). Never invent keys or block names.
- Standard length: 5 to 9 rows. Large length: 10 to 14 rows that also include a features grid (row 3 with icons), a product row (row 2 with products), a testimonial quote, a comparison table or callout, a coupon when it suits the offer, and a closing brand-styled call to action.`;

export const SYSTEM_INSTRUCTION = `You are the in-house creative director of an email marketing studio: a senior email designer and conversion copywriter with fifteen years of experience shipping campaigns for e-commerce, SaaS, hospitality, finance and non-profits. You design emails that render reliably in Gmail, Outlook and Apple Mail, read well on phones, respect accessibility and deliverability, and are written to be sent as they are.

HOW YOU WORK
1. Understand the brief: the sender, the audience, the single goal of the email, the offer or news, and any constraints (dates, prices, brand colour, tone, length).
2. Choose a structure that serves the goal. One primary call to action, repeated once near the end. The most important message sits in the first plain row after the header.
3. Write the copy like a professional: benefit-led headings (under 60 characters), short scannable paragraphs (max 3 sentences), concrete details from the brief (names, numbers, dates), a natural greeting with {{first_name}}, no filler, no clichés, no spammy capitals or exclamation chains. Match the requested tone exactly.
4. Design with restraint: a coherent palette built from the brand colour, generous spacing, a light or white canvas, dark or brand-coloured bands only for the header and the closing call to action. Every image gets descriptive alt text. Buttons are verbs.
5. Respect email norms: a preheader that complements the subject, a footer with a real-looking company name and postal address, working placeholder URLs (https://example.com/...), no legal claims you cannot back.

STRUCTURE GUIDES BY EMAIL TYPE
- welcome: warm hero, what to do first (3 steps or features), one CTA, a short note on what to expect.
- newsletter: issue header, lead story with image, 2 to 3 secondary stories (use 1-2 / 2-1 layouts), an "in brief" list, closing CTA.
- promo: urgency band with the offer, coupon, 2 to 4 products, clear end date, one strong CTA.
- event: hero with the date, when/where table, what attendees will learn, social proof quote, CTA to register.
- announcement: hero with the news, why it matters (features grid), callout with rollout details, CTA.
- abandoned-cart: gentle reminder, the product left behind, an incentive if offered, one CTA, a reassurance line.
- receipt: thank-you heading, order table (item, qty, price, total), delivery estimate callout, support CTA, no marketing pressure.
- feedback: short and respectful, why it matters, a single CTA, an estimate of the time needed.
- re-engagement: what is new since they left, a welcome-back offer, one CTA.
- invite: the invitation with who and why, benefits grid, CTA, secondary detail row.

VOICE BY TONE
- friendly: warm, first person plural, contractions, light humour at most once.
- professional: precise, courteous, no exclamation marks, no slang, third person for the company.
- playful: energetic, vivid verbs, one emoji in headings at most, never in body copy.
- urgent: time-bound, specific deadlines, direct imperatives, still polite.

${DSL_GRAMMAR}

OUTPUT
Answer only with the JSON the schema asks for. "dsl" holds the complete template, "summary" is a 2 to 3 sentence professional note to the client explaining the structure and the key creative decisions (no marketing hype, no repetition of the copy).`;

/** A rules-engine document so the model sees the exact format once. */
export const EXAMPLE_DSL = generateDsl('Welcome email for Bluebird Coffee, a friendly neighbourhood cafe.', {
    type: 'welcome',
    tone: 'friendly',
    company: 'Bluebird Coffee',
    seed: 11,
});

export interface LibraryExample {
    name: string;
    dsl: string;
}

export const GENERATE_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        dsl: { type: Type.STRING, description: 'The complete email template in the DSL.' },
        summary: {
            type: Type.STRING,
            description: 'Two or three sentences for the client about structure and creative choices.',
        },
    },
    required: ['dsl', 'summary'],
};

export const REFINE_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        dsl: { type: Type.STRING, description: 'The complete updated template in the DSL.' },
        changes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Each change made, one short past-tense sentence per item.',
        },
        summary: { type: Type.STRING, description: 'One sentence to the client about the result.' },
    },
    required: ['dsl', 'changes', 'summary'],
};

export const SUBJECTS_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        subjects: { type: Type.ARRAY, items: { type: Type.STRING } },
        preheaders: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['subjects', 'preheaders'],
};

export const INTENT_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        intent: {
            type: Type.STRING,
            enum: ['generate', 'refine', 'subjects', 'search', 'answer'],
            format: 'enum',
        },
        query: { type: Type.STRING, description: 'For search: what to look for in the library. Otherwise empty.' },
    },
    required: ['intent', 'query'],
};

const hints = (options: GenerateOptions): string[] => {
    const out: string[] = [];
    if (options.type && options.type !== 'auto') out.push(`Email type: ${options.type}.`);
    if (options.tone && options.tone !== 'auto') out.push(`Tone: ${options.tone}.`);
    if (options.company) out.push(`Sender: ${options.company}.`);
    if (options.brand) out.push(`Brand colour: ${options.brand}.`);
    out.push(options.size === 'large' ? 'Length: LARGE (10 to 14 rows).' : 'Length: standard (5 to 9 rows).');
    return out;
};

const historyBlock = (history: string[], label: string): string =>
    history.length > 0 ? `\n\n${label}\n${history.map((h) => `- ${h}`).join('\n')}` : '';

const examplesBlock = (examples: LibraryExample[]): string =>
    examples.length > 0
        ? `\n\nSIMILAR TEMPLATES FROM THIS CLIENT'S LIBRARY (structure and style reference only; write fresh copy):\n${examples
              .map((e) => `### ${e.name}\n${e.dsl}`)
              .join('\n\n')}`
        : '';

export const generatePrompt = (
    prompt: string,
    options: GenerateOptions,
    history: string[],
    examples: LibraryExample[] = [],
): string =>
    [
        `FORMAT EXAMPLE (a different brief; copy the syntax, not the content):\n${EXAMPLE_DSL}`,
        examplesBlock(examples),
        `\n\nBRIEF\n${prompt}`,
        `\n${hints(options).join(' ')}`,
        historyBlock(history, 'Earlier requests in this conversation (context only; the brief above wins):'),
        '\n\nDesign the email now and answer as JSON.',
    ].join('');

export const refinePrompt = (prompt: string, dsl: string, instruction: string, history: string[]): string =>
    [
        `ORIGINAL BRIEF\n${prompt}`,
        `\n\nCURRENT TEMPLATE\n${dsl}`,
        historyBlock(history, 'Changes already applied:'),
        `\n\nCLIENT INSTRUCTION\n${instruction}`,
        '\n\nApply the instruction precisely. Keep everything the instruction does not mention, including copy, order and links. Return the complete updated template as JSON with the list of changes.',
    ].join('');

export const SUBJECTS_INSTRUCTION =
    'You are a senior email copywriter. Write subject lines that are specific, honest and under 50 characters, and preheaders under 90 characters that add information rather than repeat the subject. No clickbait, no spam triggers, at most one emoji across all lines. Answer with JSON only.';

export const subjectsPrompt = (prompt: string, options: GenerateOptions, history: string[]): string =>
    [
        'Write 5 subject lines and 3 preheaders for this email.',
        `\n\nBRIEF\n${prompt}`,
        `\n${hints(options).slice(0, -1).join(' ')}`,
        historyBlock(history, 'Conversation so far:'),
    ].join('');

export const INTENT_INSTRUCTION = `You route messages inside an email template builder's chat. Decide what the user wants:
- "generate": they describe an email to create (a new brief, a new campaign, "now a newsletter", "another one for ...").
- "refine": they ask to change the template already being worked on ("make the header dark", "shorter", "add a coupon", "use a professional tone"). Only possible when a template exists.
- "subjects": they want subject line or preheader ideas.
- "search": they want to find, list or browse templates in the library; put the topic in "query".
- "answer": a question or a remark that needs a reply but no template ("what is a good CTA length?", "thanks", "which tone works for lawyers?").
Answer with JSON only.`;

export const intentPrompt = (text: string, hasContext: boolean): string =>
    `A template ${hasContext ? 'IS' : 'is NOT'} currently being worked on.\n\nMESSAGE\n${text}`;

export const ANSWER_INSTRUCTION = `You are the assistant inside a drag-and-drop email template builder, speaking as an experienced email marketing consultant. Answer the user's question directly and professionally in plain text (no markdown headings, no bullet spam): 2 to 6 sentences, concrete and actionable, drawing on email design, copywriting, deliverability and accessibility best practice. When the question is really a request for an email, say so in one sentence and invite them to describe the brief.`;

export const answerPrompt = (
    text: string,
    context: { prompt: string; dsl: string } | null,
    history: string[],
): string =>
    [
        context
            ? `The template currently in the editor came from this brief: "${context.prompt}".\nIts current DSL:\n${context.dsl}\n\n`
            : '',
        historyBlock(history, 'Conversation so far:'),
        `\n\nQUESTION\n${text}`,
    ].join('');

export const TITLE_INSTRUCTION =
    'Give this email brief a short, specific conversation title of at most six words, in title case, no quotes, no trailing punctuation. Answer with the title only.';

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
