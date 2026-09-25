/**
 * Synthesises the fine-tuning dataset: natural-language prompts paired with
 * the DSL the rules engine produces, plus any generations users rated up.
 *
 *   pnpm --filter server dataset            # writes data/train.jsonl + data/eval.jsonl
 *   COUNT=8000 pnpm --filter server dataset
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { generations } from '../db.ts';
import { parseDsl } from '../dsl.ts';
import {
    INDUSTRIES,
    type EmailType,
    type Tone,
    generateDsl,
    mulberry32,
} from '../generator.ts';

const TYPES: EmailType[] = [
    'welcome', 'newsletter', 'promo', 'event', 'announcement',
    'abandoned-cart', 'receipt', 'feedback', 're-engagement', 'invite',
];
const TONES: Tone[] = ['friendly', 'professional', 'playful', 'urgent'];

const COMPANIES = [
    'ACME', 'Northwind', 'Bluebird Coffee', 'Lumen Labs', 'Harbour Realty', 'PeakFit',
    'Ezyiah', 'Sunrise Bakery', 'Atlas Travel', 'Kindred Foundation', 'Pixel Studio',
    'Verdant Yoga', 'Summit Software', 'Maple & Co', 'Orbit Learning', 'Tidewater Bank',
];

const TYPE_PHRASES: Record<EmailType, string[]> = {
    welcome: ['a welcome email', 'an onboarding email for new users', 'a getting-started email', 'a welcome series opener'],
    newsletter: ['a weekly newsletter', 'a monthly digest', 'a company newsletter', 'a news roundup email'],
    promo: ['a sale email', 'a promotional email', 'a discount offer email', 'a flash sale announcement'],
    event: ['an event invitation', 'a webinar invite', 'a workshop registration email', 'a conference announcement'],
    announcement: ['a product announcement', 'a new feature launch email', 'an announcement email', 'a product update email'],
    'abandoned-cart': ['an abandoned cart reminder', 'a cart recovery email', 'a "you left something behind" email'],
    receipt: ['an order confirmation', 'a receipt email', 'a purchase confirmation email', 'a shipping confirmation'],
    feedback: ['a feedback request', 'a customer survey email', 'a review request email', 'an NPS survey email'],
    're-engagement': ['a win-back email', 'a re-engagement email for inactive users', 'a "we miss you" email'],
    invite: ['an invitation email', 'a referral email', 'a team invite email', 'a refer-a-friend email'],
};

const FRAMES = [
    'Write {what} for {company}, {industryDesc}.',
    'Create {what} for {company}. {toneDesc}',
    '{What} for a {industryNoun} called {company}. {toneDesc}',
    'I need {what} for my {industryNoun} {company}.',
    'Generate {what}. Company: {company}. Industry: {industryNoun}. Tone: {tone}.',
    '{company} needs {what}, {toneDesc}',
    'Make {what} for {company} ({industryNoun}).',
    'Design {what} for {company}, keep it {tone}.',
];

const INDUSTRY_NOUN: Record<string, string[]> = {
    saas: ['SaaS startup', 'software company', 'B2B app'],
    ecommerce: ['online store', 'fashion brand', 'ecommerce shop'],
    restaurant: ['restaurant', 'cafe', 'bakery'],
    fitness: ['gym', 'yoga studio', 'fitness coach'],
    'real-estate': ['real estate agency', 'property agent'],
    education: ['online course', 'school', 'learning platform'],
    finance: ['accounting firm', 'bookkeeping service', 'finance app'],
    travel: ['travel agency', 'hotel', 'tour operator'],
    nonprofit: ['charity', 'nonprofit', 'community organisation'],
    agency: ['marketing agency', 'design studio', 'consulting firm'],
    general: ['business', 'brand', 'company'],
};

const TONE_DESC: Record<Tone, string[]> = {
    friendly: ['Keep the tone friendly and warm.', 'Friendly, conversational tone.', 'Make it warm and welcoming.'],
    professional: ['Professional tone.', 'Keep it formal and businesslike.', 'Corporate, polished tone.'],
    playful: ['Make it playful and fun.', 'Playful tone with a bit of personality.', 'Fun, bold and cheeky.'],
    urgent: ['Urgent tone, last chance.', 'Create urgency, the offer ends soon.', 'Make it feel time-sensitive.'],
};

const pick = <T>(items: T[], rnd: () => number): T => items[Math.floor(rnd() * items.length)];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const sample = (rnd: () => number) => {
    const type = pick(TYPES, rnd);
    const tone = pick(TONES, rnd);
    const industry = pick(Object.keys(INDUSTRIES), rnd);
    const company = pick(COMPANIES, rnd);
    const noun = pick(INDUSTRY_NOUN[industry], rnd);
    const what = pick(TYPE_PHRASES[type], rnd);
    const discount = type === 'promo' ? `${pick([10, 15, 20, 25, 30, 40, 50], rnd)}% off` : '';
    let prompt = pick(FRAMES, rnd)
        .replace('{what}', what)
        .replace('{What}', cap(what))
        .replace('{company}', company)
        .replace('{industryDesc}', `a ${noun}`)
        .replace('{industryNoun}', noun)
        .replace('{toneDesc}', pick(TONE_DESC[tone], rnd))
        .replace('{tone}', tone);
    if (discount) prompt += ` Offer ${discount}.`;
    if (rnd() < 0.2) prompt += ` Brand colour ${INDUSTRIES[industry].brand}.`;
    const dsl = generateDsl(prompt, { type, tone, company, seed: Math.floor(rnd() * 1e9) });
    return { prompt, dsl };
};

const count = Number(process.env.COUNT ?? 4000);
const rnd = mulberry32(Number(process.env.SEED ?? 42));
const rows: { prompt: string; dsl: string }[] = [];
const seen = new Set<string>();
while (rows.length < count) {
    const row = sample(rnd);
    if (seen.has(row.prompt)) continue;
    seen.add(row.prompt);
    if (parseDsl(row.dsl).rows.length === 0) continue;
    rows.push(row);
}

const approved = generations.approved();
const all = [...rows, ...approved];
const evalSize = Math.max(50, Math.floor(all.length * 0.05));
const evalRows = all.slice(0, evalSize);
const trainRows = all.slice(evalSize);

const outDir = path.resolve(process.env.DATA_DIR ?? 'data');
mkdirSync(outDir, { recursive: true });
const toJsonl = (items: { prompt: string; dsl: string }[]) => `${items.map((r) => JSON.stringify(r)).join('\n')}\n`;
writeFileSync(path.join(outDir, 'train.jsonl'), toJsonl(trainRows));
writeFileSync(path.join(outDir, 'eval.jsonl'), toJsonl(evalRows));

// eslint-disable-next-line no-console
console.log(`wrote ${trainRows.length} train and ${evalRows.length} eval examples (${approved.length} user-approved) to ${outDir}`);
