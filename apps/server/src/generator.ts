/**
 * Rules engine: turns a natural-language request into template DSL.
 *
 * It serves two purposes: the fallback generator when no fine-tuned model is
 * running, and the synthetic dataset source used to fine-tune that model.
 */
import type { DslBlock, DslDocument, DslRow } from './dsl.ts';
import { stringifyDsl } from './dsl.ts';

export type EmailType =
    | 'welcome'
    | 'newsletter'
    | 'promo'
    | 'event'
    | 'announcement'
    | 'abandoned-cart'
    | 'receipt'
    | 'feedback'
    | 're-engagement'
    | 'invite';

export type Tone = 'friendly' | 'professional' | 'playful' | 'urgent';

export interface GenerateOptions {
    type?: EmailType | 'auto';
    tone?: Tone | 'auto';
    brand?: string;
    company?: string;
    /** Deterministic output for datasets and tests. */
    seed?: number;
}

export interface Analysis {
    type: EmailType;
    tone: Tone;
    industry: string;
    company: string;
    brand: string;
    discount: string | null;
    product: string | null;
}

/* ------------------------------------------------------------------ */
/* Knowledge banks                                                      */
/* ------------------------------------------------------------------ */

export const INDUSTRIES: Record<
    string,
    { keywords: string[]; brand: string; products: string[]; features: string[] }
> = {
    saas: {
        keywords: ['saas', 'software', 'app', 'platform', 'startup', 'tool', 'dashboard'],
        brand: '#2563eb',
        products: ['Pro plan', 'Team workspace', 'Analytics add-on'],
        features: [
            '⚡ Fast setup|Connect your account in under two minutes.',
            '🔒 Secure by default|SOC 2 controls and encryption at rest.',
            '📈 Insights|Dashboards that show what moved the needle.',
            '🤝 Collaboration|Invite your team and work in one place.',
        ],
    },
    ecommerce: {
        keywords: ['shop', 'store', 'ecommerce', 'e-commerce', 'retail', 'fashion', 'clothing', 'shoes', 'product', 'sale', 'order'],
        brand: '#111827',
        products: ['Runner Pro sneakers', 'Weekend tote', 'Merino crew sweater', 'Linen shirt'],
        features: [
            '🚚 Free shipping|On every order over $50.',
            '↩ Easy returns|30 days, no questions asked.',
            '⭐ Loved by thousands|4.8 average from 12,000 reviews.',
            '🔒 Secure checkout|Pay with card, PayPal or Apple Pay.',
        ],
    },
    restaurant: {
        keywords: ['restaurant', 'cafe', 'coffee', 'bakery', 'food', 'menu', 'dinner', 'pizza', 'bar'],
        brand: '#b45309',
        products: ['Chef’s tasting menu', 'Weekend brunch', 'Seasonal pasta'],
        features: [
            '🍽 Fresh daily|Ingredients from local farms every morning.',
            '📅 Book online|Reserve a table in two taps.',
            '🎉 Private events|Spaces for 10 to 80 guests.',
        ],
    },
    fitness: {
        keywords: ['gym', 'fitness', 'yoga', 'workout', 'training', 'health', 'wellness', 'coach'],
        brand: '#16a34a',
        products: ['6-week challenge', 'Personal training pack', 'Yoga membership'],
        features: [
            '💪 Expert coaches|Certified trainers in every class.',
            '📱 Track progress|See your streaks and personal bests.',
            '🕒 Open early|Doors open at 5am, seven days a week.',
        ],
    },
    'real-estate': {
        keywords: ['real estate', 'property', 'realtor', 'home', 'apartment', 'listing', 'mortgage'],
        brand: '#0f766e',
        products: ['3-bed family home', 'City apartment', 'Waterfront listing'],
        features: [
            '🏡 New listings weekly|Be first to see homes in your area.',
            '📊 Market reports|Know what your street is worth.',
            '🤝 Local agents|People who know the neighbourhood.',
        ],
    },
    education: {
        keywords: ['course', 'school', 'university', 'learning', 'education', 'class', 'students', 'webinar', 'workshop'],
        brand: '#7c3aed',
        products: ['Beginner course', 'Masterclass bundle', 'Certification track'],
        features: [
            '🎓 Learn by doing|Projects, not just lectures.',
            '⏱ Self-paced|Study when it suits you.',
            '🏅 Certificate|Show employers what you can do.',
        ],
    },
    finance: {
        keywords: ['bank', 'finance', 'accounting', 'accountant', 'tax', 'bas', 'invoice', 'bookkeeping', 'insurance', 'loan'],
        brand: '#1d4ed8',
        products: ['Tax-time package', 'Monthly bookkeeping', 'BAS review'],
        features: [
            '🧾 Accurate|Every reconciliation double-checked.',
            '⏰ On time|Lodgements before the deadline, every quarter.',
            '🔐 Private|Bank-grade security for your records.',
        ],
    },
    travel: {
        keywords: ['travel', 'hotel', 'flight', 'trip', 'tour', 'holiday', 'vacation', 'airline', 'resort'],
        brand: '#0891b2',
        products: ['Bali escape', 'City break bundle', 'Ski week'],
        features: [
            '✈ Best fares|Price-matched on every route.',
            '🛎 24/7 support|A human on the line, wherever you are.',
            '🧳 Flexible changes|Move dates without fees.',
        ],
    },
    nonprofit: {
        keywords: ['charity', 'nonprofit', 'non-profit', 'donation', 'donate', 'volunteer', 'fundraiser', 'community'],
        brand: '#dc2626',
        products: ['Monthly giving', 'Sponsor a student', 'Winter appeal'],
        features: [
            '❤ Every dollar counts|92% goes straight to programs.',
            '🌍 Local impact|Projects in your own community.',
            '📣 Transparent|Quarterly reports on where funds go.',
        ],
    },
    agency: {
        keywords: ['agency', 'marketing', 'design', 'creative', 'studio', 'consulting', 'freelance'],
        brand: '#ea580c',
        products: ['Brand refresh', 'Growth retainer', 'Website sprint'],
        features: [
            '🎯 Strategy first|Work that ladders up to goals.',
            '🎨 Craft|Design people actually remember.',
            '📊 Results|Reported monthly, in plain English.',
        ],
    },
    general: {
        keywords: [],
        brand: '#2563eb',
        products: ['Starter pack', 'Premium bundle'],
        features: [
            '✓ Simple|Up and running in minutes.',
            '★ Trusted|Thousands of happy customers.',
            '♥ Support|Real people, quick replies.',
        ],
    },
};

const TYPE_KEYWORDS: Record<EmailType, string[]> = {
    welcome: ['welcome', 'onboarding', 'getting started', 'new user', 'signup', 'sign up', 'joined'],
    newsletter: ['newsletter', 'digest', 'weekly', 'monthly', 'roundup', 'update', 'news'],
    promo: ['sale', 'discount', 'promo', 'offer', 'deal', '% off', 'percent off', 'coupon', 'black friday', 'launch offer', 'flash'],
    event: ['event', 'webinar', 'conference', 'meetup', 'workshop', 'rsvp', 'seminar', 'launch party'],
    announcement: ['announce', 'announcement', 'introducing', 'new feature', 'launch', 'release', 'product update'],
    'abandoned-cart': ['abandoned', 'cart', 'left behind', 'forgot something', 'checkout'],
    receipt: ['receipt', 'order confirmation', 'invoice', 'confirmation', 'purchase', 'payment received', 'shipped'],
    feedback: ['feedback', 'survey', 'review', 'rate', 'nps', 'how did we do'],
    're-engagement': ['miss you', 'come back', 'inactive', 're-engage', 'win back', 'been a while', 'winback'],
    invite: ['invite', 'invitation', 'join us', 'referral', 'refer a friend'],
};

const TONE_KEYWORDS: Record<Tone, string[]> = {
    friendly: ['friendly', 'warm', 'casual', 'conversational', 'welcoming'],
    professional: ['professional', 'formal', 'corporate', 'business', 'b2b', 'enterprise'],
    playful: ['playful', 'fun', 'quirky', 'cheeky', 'bold', 'emoji'],
    urgent: ['urgent', 'last chance', 'ends', 'hurry', 'limited', 'today only', 'final'],
};

/* ------------------------------------------------------------------ */
/* Analysis                                                             */
/* ------------------------------------------------------------------ */

const pick = <T>(items: T[], rnd: () => number): T =>
    items[Math.floor(rnd() * items.length)];

/** Small deterministic PRNG so datasets and tests are reproducible. */
export const mulberry32 = (seed: number): (() => number) => {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const hashString = (value: string): number => {
    let h = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        h ^= value.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
};

const detect = <K extends string>(
    prompt: string,
    bank: Record<K, string[]>,
    fallback: K,
): K => {
    const lower = prompt.toLowerCase();
    let best: { key: K; score: number } = { key: fallback, score: 0 };
    (Object.keys(bank) as K[]).forEach((key) => {
        const score = bank[key].reduce(
            (sum, kw) => sum + (lower.includes(kw) ? kw.length : 0),
            0,
        );
        if (score > best.score) best = { key, score };
    });
    return best.key;
};

const detectCompany = (prompt: string): string | null => {
    const patterns = [
        /\bfor\s+(?:my|our|the|a|an)?\s*(?:company|brand|business|store|shop|startup|app|firm|agency)?\s*(?:called|named)\s+["“]?([A-Z][\w&'.-]*(?:\s+[A-Z][\w&'.-]*){0,3})["”]?/,
        /\bfor\s+["“]([^"”]{2,40})["”]/,
        /\bfor\s+([A-Z][\w&'.-]*(?:\s+[A-Z][\w&'.-]*){0,2})(?=[\s,.;:]|$)/,
        /\b(?:from|by|at)\s+([A-Z][\w&'.-]*(?:\s+[A-Z][\w&'.-]*){0,2})(?=[\s,.;:]|$)/,
    ];
    for (const pattern of patterns) {
        const match = prompt.match(pattern);
        if (match && !/^(?:A|An|The|My|Our|Please|Write|Create|Make|I)$/.test(match[1])) {
            return match[1].trim();
        }
    }
    return null;
};

export const analyse = (prompt: string, options: GenerateOptions = {}): Analysis => {
    const industryBank = Object.fromEntries(
        Object.entries(INDUSTRIES).map(([k, v]) => [k, v.keywords]),
    ) as Record<string, string[]>;
    const industry = detect(prompt, industryBank, 'general');
    const type =
        options.type && options.type !== 'auto'
            ? options.type
            : detect(prompt, TYPE_KEYWORDS, 'announcement');
    const tone =
        options.tone && options.tone !== 'auto'
            ? options.tone
            : detect(prompt, TONE_KEYWORDS, 'friendly');
    const hex = prompt.match(/#[0-9a-f]{6}\b/i)?.[0];
    const discount = prompt.match(/(\d{1,2})\s?%(?:\s?off)?/i)?.[1] ?? null;
    const product = prompt.match(/(?:for|of|about)\s+(?:our|the|my)?\s*new\s+([a-z][\w\s-]{2,30}?)(?=[\s,.;:]|$)/i)?.[1] ?? null;
    return {
        type,
        tone,
        industry,
        company: options.company || detectCompany(prompt) || 'ACME',
        brand: options.brand || hex || INDUSTRIES[industry].brand,
        discount: discount ? `${discount}%` : null,
        product: product ? product.trim() : null,
    };
};

/* ------------------------------------------------------------------ */
/* Copy banks                                                           */
/* ------------------------------------------------------------------ */

const greeting: Record<Tone, string[]> = {
    friendly: ['Hi {{first_name}} 👋', 'Hey {{first_name}},', 'Hello {{first_name}}!'],
    professional: ['Dear {{first_name}},', 'Hello {{first_name}},'],
    playful: ['Hey hey {{first_name}}! 🎉', 'Well hello, {{first_name}} ✨'],
    urgent: ['{{first_name}}, quick heads up:', 'Don’t miss this, {{first_name}}:'],
};

const cta: Record<EmailType, string[]> = {
    welcome: ['Get started', 'Set up my account', 'Take the tour'],
    newsletter: ['Read the full story', 'Read more', 'See what’s new'],
    promo: ['Shop the sale', 'Claim my discount', 'Shop now'],
    event: ['Save my seat', 'Register now', 'RSVP'],
    announcement: ['See what’s new', 'Try it now', 'Learn more'],
    'abandoned-cart': ['Return to my cart', 'Complete my order', 'Finish checkout'],
    receipt: ['View my order', 'Track my order', 'Download receipt'],
    feedback: ['Share my feedback', 'Take the 1-minute survey', 'Leave a review'],
    're-engagement': ['Come back', 'See what I missed', 'Reactivate my account'],
    invite: ['Accept invitation', 'Join now', 'Invite a friend'],
};

const headline: Record<EmailType, string[]> = {
    welcome: ['Welcome to {company}', 'You’re in. Welcome aboard.', 'Glad you’re here, {{first_name}}'],
    newsletter: ['The {company} Digest', 'This week at {company}', 'What’s new at {company}'],
    promo: ['{discount} off everything', 'Our biggest sale of the year', 'Save {discount} this week only'],
    event: ['You’re invited', 'Join us live', 'Save the date'],
    announcement: ['Introducing {product}', 'Something new from {company}', 'Big news from {company}'],
    'abandoned-cart': ['You left something behind', 'Still thinking it over?', 'Your cart is waiting'],
    receipt: ['Thanks for your order', 'Order confirmed', 'Your receipt from {company}'],
    feedback: ['How did we do?', 'Got a minute? We’d love your feedback', 'Tell us what you think'],
    're-engagement': ['We miss you, {{first_name}}', 'It’s been a while', 'Here’s what you missed'],
    invite: ['{{first_name}} invited you to {company}', 'Join {company}', 'You’ve been invited'],
};

const body: Record<EmailType, string[]> = {
    welcome: [
        'We’re thrilled to have you. Here are a few quick things to get you started, and a button to jump straight in.',
        'Thanks for joining {company}. It takes two minutes to set things up, and we’ll be right here if you need a hand.',
    ],
    newsletter: [
        'Here’s a round-up of what happened this week, plus a few things we think you’ll like.',
        'Grab a coffee. This edition has product news, a customer story and a couple of reads from the team.',
    ],
    promo: [
        'Use code {code} at checkout. The offer ends Sunday at midnight, so don’t wait.',
        'For a limited time, everything is {discount} off. No exclusions, no catches.',
    ],
    event: [
        'Join us for an hour of practical ideas you can use straight away. Seats are limited, so grab yours early.',
        'We’re bringing together people who care about the same things you do. Bring a question, leave with answers.',
    ],
    announcement: [
        'We’ve been working on this for months and we think you’ll love it. Here’s what’s changed and why it matters.',
        'Today we’re launching {product}. It’s faster, simpler and built around the feedback you gave us.',
    ],
    'abandoned-cart': [
        'Your items are saved and ready when you are. Complete your order today and we’ll get it out the door tomorrow.',
        'No pressure, but stock is moving fast. Finish checking out before your favourites are gone.',
    ],
    receipt: [
        'We’ve received your order and it’s being prepared. You’ll get another email with tracking as soon as it ships.',
        'Here’s a summary of your purchase. Keep this email for your records.',
    ],
    feedback: [
        'Your opinion shapes what we build next. It takes one minute and every answer is read by a real person.',
        'We’d love to know how your experience went. Honest answers help us do better.',
    ],
    're-engagement': [
        'A lot has changed since you last logged in. Here are the highlights, and an easy way to pick up where you left off.',
        'We noticed you’ve been away. Come back this week and we’ll throw in a little something to say welcome back.',
    ],
    invite: [
        'Someone thinks you’d be a great fit. Accept the invitation to join the team and start collaborating today.',
        'Know someone who’d love {company}? Share your link and you’ll both get a reward.',
    ],
};

/* ------------------------------------------------------------------ */
/* Blueprint                                                            */
/* ------------------------------------------------------------------ */

const b = (kind: string, args: string[] = [], url?: string): DslBlock => ({ kind, args, url });
const row = (columns: DslBlock[][], layout = '1', style: DslRow['style'] = 'plain'): DslRow => ({
    layout,
    style,
    columns,
});

const fill = (text: string, a: Analysis, extra: Record<string, string> = {}): string =>
    text
        .replace(/\{company\}/g, a.company)
        .replace(/\{discount\}/g, a.discount ?? '20%')
        .replace(/\{product\}/g, a.product ?? 'our new release')
        .replace(/\{code\}/g, extra.code ?? 'SAVE20');

/** Builds the DSL document for an analysed request. */
export const blueprint = (a: Analysis, rnd: () => number): DslDocument => {
    const bank = INDUSTRIES[a.industry];
    const code = `SAVE${(a.discount ?? '20%').replace('%', '')}`;
    const g = pick(greeting[a.tone], rnd);
    const h = fill(pick(headline[a.type], rnd), a);
    const t = fill(pick(body[a.type], rnd), a, { code });
    const c = pick(cta[a.type], rnd);
    const features = [...bank.features].sort(() => rnd() - 0.5).slice(0, 3);
    const products = [...bank.products].sort(() => rnd() - 0.5);
    const address = '123 Example Street, Sydney NSW 2000';
    const headerStyle: DslRow['style'] = a.tone === 'professional' ? 'plain' : 'dark';

    const header = row([[b('heading', [a.company]), b('menu', ['Home', 'Products', 'Contact'])]], '1', headerStyle);
    const hero = (withImage: boolean) =>
        row([
            [
                ...(withImage ? [b('image', ['Hero image'])] : []),
                b('heading', [h]),
                b('text', [`${g} ${t}`]),
                b('button', [c], 'https://example.com'),
            ],
        ]);
    const featureRow = row(features.map((f) => [b('icons', [f])]), '3');
    const footer = row([[b('social'), b('footer', [`${a.company}`, address])]], '1', 'light');

    const rows: DslRow[] = [header];
    switch (a.type) {
        case 'welcome':
            rows.push(hero(true), row([[b('heading', ['Three ways to get started'])]]), featureRow, row([[b('button', [c], 'https://example.com')]]));
            break;
        case 'newsletter':
            rows.push(
                row([[b('heading', [h]), b('text', [`Issue #${Math.floor(rnd() * 90) + 10} · ${t}`])]]),
                row([[b('image', ['Story image'])], [b('heading', [fill(pick(headline.announcement, rnd), a)]), b('text', [pick(body.announcement, rnd).replace(/\{product\}/g, products[0]).replace(/\{company\}/g, a.company)]), b('button', ['Read more'], 'https://example.com')]], '1-2'),
                row([[b('heading', [pick(['Customer story', 'From the community', 'Tip of the week'], rnd)]), b('text', [pick(body.newsletter, rnd)]), b('button', ['Read more'], 'https://example.com')], [b('image', ['Story image'])]], '2-1'),
                row([[b('heading', ['In brief']), b('list', [`<strong>Product:</strong> ${products[1] ?? products[0]} is now available`, '<strong>Community:</strong> new members this month', '<strong>Events:</strong> join our next live session'])]]),
            );
            break;
        case 'promo':
            rows.push(
                row([[b('text', [a.tone === 'urgent' ? 'ENDS SUNDAY' : 'LIMITED TIME']), b('heading', [h]), b('text', [t]), b('button', [c], 'https://example.com')]], '1', 'brand'),
                row([[b('coupon', [code, 'Use code at checkout', 'Valid on all orders until Sunday midnight.'])]]),
                row([[b('product', [products[0], '$48.00', '$80.00'])], [b('product', [products[1] ?? products[0], '$96.00', '$120.00'])]], '2'),
            );
            break;
        case 'event':
            rows.push(
                hero(true),
                row([[b('table', ['When,Where', 'Thursday 7pm,Online · Zoom'])]]),
                row([[b('heading', ['What you’ll learn'])]]),
                featureRow,
                row([[b('quote', ['Last time was packed with practical advice I used the next morning.', 'Sam Rivera', 'Attendee'])]]),
                row([[b('button', [c], 'https://example.com')]]),
            );
            break;
        case 'announcement':
            rows.push(hero(true), row([[b('heading', ['Why you’ll love it'])]]), featureRow, row([[b('callout', ['Rolling out this week', 'You’ll see it in your account automatically. Nothing to install.'])]]), row([[b('button', [c], 'https://example.com')]]));
            break;
        case 'abandoned-cart':
            rows.push(
                row([[b('heading', [h]), b('text', [`${g} ${t}`])]]),
                row([[b('product', [products[0], '$48.00', ''])]]),
                row([[b('coupon', [code, 'Complete your order with', 'Valid for the next 48 hours.'])]]),
                row([[b('button', [c], 'https://example.com')]]),
            );
            break;
        case 'receipt':
            rows.push(
                row([[b('heading', [h]), b('text', [`${g} ${t}`])]]),
                row([[b('table', ['Item,Qty,Price', `${products[0]},1,$48.00`, `${products[1] ?? 'Shipping'},1,$9.00`, 'Total,,$57.00'])]]),
                row([[b('callout', ['Delivery estimate', 'Arrives in 3 to 5 business days. We’ll email tracking when it ships.'])]]),
                row([[b('button', [c], 'https://example.com')]]),
            );
            break;
        case 'feedback':
            rows.push(
                row([[b('heading', [h]), b('text', [`${g} ${t}`])]]),
                row([[b('quote', ['We read every reply and act on the common themes each month.', 'The {company} team'.replace('{company}', a.company), ''])]]),
                row([[b('button', [c], 'https://example.com')]]),
            );
            break;
        case 're-engagement':
            rows.push(hero(true), row([[b('heading', ['What’s new since you left'])]]), featureRow, row([[b('coupon', [code, 'Welcome back gift', 'Valid for 7 days on your next order.'])]]), row([[b('button', [c], 'https://example.com')]]));
            break;
        case 'invite':
            rows.push(
                row([[b('heading', [h]), b('text', [`${g} ${t}`]), b('button', [c], 'https://example.com')]], '1', 'brand'),
                featureRow,
            );
            break;
        default:
            rows.push(hero(true));
    }
    rows.push(footer);

    return {
        title: h.replace(/\{\{[^}]+\}\}/g, 'there'),
        preheader: t.split(/(?<=[.!?])\s/)[0].slice(0, 110).replace(/\{\{[^}]+\}\}/g, 'there'),
        brand: a.brand,
        bg: a.tone === 'professional' ? '#ffffff' : '#f2f2f2',
        rows,
    };
};

/** Full rules pipeline: prompt → DSL text. */
export const generateDsl = (prompt: string, options: GenerateOptions = {}): string => {
    const analysis = analyse(prompt, options);
    const seed = options.seed ?? hashString(prompt + JSON.stringify(options));
    return stringifyDsl(blueprint(analysis, mulberry32(seed)));
};
