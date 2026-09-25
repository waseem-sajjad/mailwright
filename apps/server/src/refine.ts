/**
 * Rules-based refinement: applies a chat instruction ("make the header dark",
 * "add a coupon SAVE10", "professional tone") to an existing DSL document.
 * Used by /api/ai/refine when no model answers, and to synthesise
 * refinement examples for fine-tuning.
 */
import type { DslBlock, DslDocument, DslRow } from './dsl.ts';
import { parseDsl, stringifyDsl } from './dsl.ts';
import { analyse, blueprint, mulberry32, type GenerateOptions, type Tone } from './generator.ts';

export interface RefineResult {
    dsl: string;
    /** Human-readable summary of what changed. */
    applied: string[];
}

const TONES: Tone[] = ['friendly', 'professional', 'playful', 'urgent'];

const quoted = (text: string): string | null => text.match(/["“']([^"”']{1,120})["”']/)?.[1] ?? null;
const hex = (text: string): string | null => text.match(/#[0-9a-f]{6}\b/i)?.[0] ?? null;

const block = (kind: string, args: string[] = [], url?: string): DslBlock => ({ kind, args, url });
const row = (blocks: DslBlock[], style: DslRow['style'] = 'plain'): DslRow => ({
    layout: '1',
    style,
    columns: [blocks],
});

const hasKind = (r: DslRow, kind: string) => r.columns.some((c) => c.some((b) => b.kind === kind));

/** Inserts a row before the footer row (or at the end). */
const insertBeforeFooter = (doc: DslDocument, newRow: DslRow): void => {
    const footerIndex = doc.rows.findIndex((r) => hasKind(r, 'footer') || hasKind(r, 'social'));
    if (footerIndex === -1) doc.rows.push(newRow);
    else doc.rows.splice(footerIndex, 0, newRow);
};

const ADDABLE: Record<string, (text: string) => DslBlock[]> = {
    coupon: (t) => {
        const code = t.match(/\b([A-Z0-9]{4,12})\b/)?.[1] ?? 'SAVE10';
        return [block('coupon', [code, 'Use code at checkout', 'Valid for a limited time.'])];
    },
    table: () => [block('table', ['Item,Qty,Price', 'Sample item,1,$10.00', 'Total,,$10.00'])],
    quote: () => [block('quote', ['This made our week so much easier.', 'Happy customer', ''])],
    testimonial: () => [block('quote', ['This made our week so much easier.', 'Happy customer', ''])],
    social: () => [block('social')],
    video: (t) => [block('video', [], t.match(/https?:\/\/\S+/)?.[0])],
    image: (t) => [block('image', ['Image'], t.match(/https?:\/\/\S+/)?.[0])],
    button: (t) => [block('button', [quoted(t) ?? 'Learn more'], t.match(/https?:\/\/\S+/)?.[0] ?? 'https://example.com')],
    divider: () => [block('divider')],
    spacer: () => [block('spacer', ['30'])],
    product: (t) => [block('product', [quoted(t) ?? 'Featured product', '$48.00', '$60.00'])],
    callout: (t) => [block('callout', ['Heads up', quoted(t) ?? 'Something worth knowing before you go.'])],
    list: () => [block('list', ['First point', 'Second point', 'Third point'])],
    menu: () => [block('menu', ['Home', 'Products', 'Contact'])],
    icons: () => [block('icons', ['✓ Simple|Up and running in minutes.', '★ Trusted|Thousands of happy customers.', '♥ Support|Real people, quick replies.'])],
    features: () => [block('icons', ['✓ Simple|Up and running in minutes.', '★ Trusted|Thousands of happy customers.', '♥ Support|Real people, quick replies.'])],
    footer: () => [block('footer', ['Company', '123 Example Street'])],
    heading: (t) => [block('heading', [quoted(t) ?? 'New section'])],
    text: (t) => [block('text', [quoted(t) ?? 'Add your paragraph here.'])],
    paragraph: (t) => [block('text', [quoted(t) ?? 'Add your paragraph here.'])],
};

const REMOVABLE = ['coupon', 'table', 'quote', 'social', 'video', 'image', 'button', 'divider', 'spacer', 'product', 'callout', 'list', 'menu', 'icons', 'footer', 'heading', 'text'];

/** Applies one instruction to the document. Returns what it did. */
const applyOne = (
    doc: DslDocument,
    instruction: string,
    context: { prompt: string; options: GenerateOptions; seed: number },
): string[] => {
    const text = instruction.trim();
    const lower = text.toLowerCase();
    const applied: string[] = [];

    // Tone or type change → rebuild with the same request and new option.
    const tone = TONES.find((t) => lower.includes(t));
    if (tone && /\b(tone|sound|make it|more)\b/.test(lower)) {
        const analysis = analyse(context.prompt, { ...context.options, tone });
        const rebuilt = blueprint(analysis, mulberry32(context.seed));
        Object.assign(doc, rebuilt);
        applied.push(`Rewrote the copy in a ${tone} tone`);
        return applied;
    }

    // Brand colour.
    const colour = hex(text);
    if (colour && /\b(colou?r|brand|accent|button)/.test(lower)) {
        doc.brand = colour;
        applied.push(`Set the brand colour to ${colour}`);
    }

    // Background colour.
    if (colour && /\bbackground\b/.test(lower)) {
        doc.bg = colour;
        applied.push(`Set the background to ${colour}`);
    }

    // Header / row styles.
    const styleMatch = lower.match(/\b(dark|light|brand|plain|white)\b/);
    if (styleMatch && /\b(header|top|hero|first row|banner)\b/.test(lower)) {
        const style = (styleMatch[1] === 'white' ? 'plain' : styleMatch[1]) as DslRow['style'];
        const target = /\b(hero|banner)\b/.test(lower) ? 1 : 0;
        if (doc.rows[target]) {
            doc.rows[target].style = style;
            applied.push(`Made the ${target === 0 ? 'header' : 'hero'} ${style}`);
        }
    } else if (styleMatch && /\b(all rows|everything|whole email|entire)\b/.test(lower)) {
        const style = (styleMatch[1] === 'white' ? 'plain' : styleMatch[1]) as DslRow['style'];
        doc.rows.forEach((r) => {
            r.style = style;
        });
        applied.push(`Made every row ${style}`);
    }

    // Title / preheader / heading / button text.
    const titleMatch = text.match(/\b(?:title|subject)\s*(?:to|:|=)\s*(.+)$/i);
    if (titleMatch) {
        doc.title = quoted(titleMatch[1]) ?? titleMatch[1].trim();
        applied.push('Changed the title');
    }
    const preMatch = text.match(/\bpreheader\s*(?:to|:|=)\s*(.+)$/i);
    if (preMatch) {
        doc.preheader = quoted(preMatch[1]) ?? preMatch[1].trim();
        applied.push('Changed the preheader');
    }
    if (/\b(button|cta)\b/.test(lower) && /\b(text|label|say|to)\b/.test(lower) && !/\badd\b/.test(lower)) {
        const label = quoted(text);
        if (label) {
            doc.rows.forEach((r) =>
                r.columns.forEach((c) =>
                    c.forEach((b) => {
                        if (b.kind === 'button') b.args[0] = label;
                    }),
                ),
            );
            applied.push(`Changed the button text to “${label}”`);
        }
    }
    if (/\b(main )?(heading|headline)\b/.test(lower) && /\b(to|say|change|replace)\b/.test(lower) && !/\badd\b/.test(lower)) {
        const label = quoted(text);
        if (label) {
            const hero = doc.rows.find((r, i) => i > 0 && hasKind(r, 'heading')) ?? doc.rows.find((r) => hasKind(r, 'heading'));
            const target = hero?.columns.flat().find((b) => b.kind === 'heading');
            if (target) {
                target.args[0] = label;
                applied.push(`Changed the heading to “${label}”`);
            }
        }
    }

    // Add / remove blocks.
    const addMatch = lower.match(/\b(?:add|insert|include|put)\b.*?\b(coupon|table|quote|testimonial|social|video|image|button|divider|spacer|product|callout|list|menu|icons|features|footer|heading|text|paragraph)\b/);
    if (addMatch) {
        const kind = addMatch[1];
        const blocks = ADDABLE[kind](text);
        if (kind === 'social' || kind === 'footer') {
            const last = doc.rows[doc.rows.length - 1];
            if (last && (hasKind(last, 'footer') || hasKind(last, 'social'))) last.columns[0].push(...blocks);
            else doc.rows.push(row(blocks, 'light'));
        } else {
            insertBeforeFooter(doc, row(blocks));
        }
        applied.push(`Added a ${kind}`);
    }
    const removeMatch = lower.match(/\b(?:remove|delete|drop|get rid of|without)\b.*?\b(coupon|table|quote|social|video|image|button|divider|spacer|product|callout|list|menu|icons|footer|heading|text)\b/);
    if (removeMatch) {
        const kind = removeMatch[1];
        if (!REMOVABLE.includes(kind)) return applied;
        let removed = 0;
        doc.rows = doc.rows
            .map((r) => ({
                ...r,
                columns: r.columns.map((c) =>
                    c.filter((b) => {
                        if (b.kind === kind) {
                            removed += 1;
                            return false;
                        }
                        return true;
                    }),
                ),
            }))
            .filter((r) => r.columns.some((c) => c.length > 0));
        if (removed > 0) applied.push(`Removed ${removed} ${kind} block${removed === 1 ? '' : 's'}`);
    }

    // Layout shortcuts.
    if (/\b(shorter|shorten|concise|brief)\b/.test(lower) && doc.rows.length > 3) {
        const keep = [doc.rows[0], doc.rows[1], doc.rows[doc.rows.length - 1]];
        doc.rows = keep;
        applied.push('Shortened the email to header, hero and footer');
    }
    if (/\b(no|remove|without)\b.*\b(greeting|hi |hey )/.test(lower)) {
        doc.rows.forEach((r) =>
            r.columns.forEach((c) =>
                c.forEach((b) => {
                    if (b.kind === 'text' && b.args[0]) b.args[0] = b.args[0].replace(/^[^.!?]*\{\{first_name\}\}[^.!?]*[.!?:,]\s*/, '');
                }),
            ),
        );
        applied.push('Removed the greeting');
    }

    return applied;
};

export const refineDsl = (
    dsl: string,
    instruction: string,
    context: { prompt: string; options?: GenerateOptions; seed?: number },
): RefineResult => {
    const doc = parseDsl(dsl);
    const seed = context.seed ?? 7;
    const options = context.options ?? {};
    // Support "a, b and c" style multi-instructions.
    const parts = instruction.split(/\s*(?:;|\.\s+|\band then\b|\balso\b)\s*/i).filter((p) => p.trim());
    const applied = parts.flatMap((part) => applyOne(doc, part, { prompt: context.prompt, options, seed }));

    if (applied.length === 0) {
        // Nothing matched: fold the instruction into the request and rebuild.
        const analysis = analyse(`${context.prompt}. ${instruction}`, options);
        const rebuilt = blueprint(analysis, mulberry32(seed + 1));
        return { dsl: stringifyDsl(rebuilt), applied: ['Rebuilt the template with your note added to the brief'] };
    }
    return { dsl: stringifyDsl(doc), applied };
};

/** Instruction bank for synthesising refinement training pairs. */
export const REFINE_INSTRUCTIONS: string[] = [
    'make the header dark',
    'make the header light',
    'make the hero brand coloured',
    'make it professional',
    'use a playful tone',
    'make the tone urgent',
    'change the brand colour to #16a34a',
    'use #7c3aed as the brand color',
    'add a coupon SAVE15',
    'add a table with the order summary',
    'add a testimonial',
    'add a video',
    'add a button "Book a demo"',
    'add a callout',
    'add a product',
    'add social icons',
    'remove the coupon',
    'remove the menu',
    'remove the social icons',
    'remove the video',
    'change the button text to "Start free trial"',
    'change the heading to "Big news"',
    'set the title to "A quick update"',
    'make it shorter',
    'remove the greeting',
    'set the background to #ffffff',
];
