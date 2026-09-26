/** Subject line and preheader suggestions from the same analysis the rules engine uses. */
import { analyse, type EmailType, type GenerateOptions, mulberry32 } from './generator';

const SUBJECTS: Record<EmailType, string[]> = {
    welcome: [
        'Welcome to {company}, {{first_name}} 👋',
        'You’re in. Here’s how to get started',
        'Your {company} account is ready',
        'Three quick wins for your first week',
        'Glad you’re here',
    ],
    newsletter: [
        'This week at {company}',
        'The {company} digest: 3 things worth your time',
        'What we shipped, learned and loved this month',
        'Your weekly round-up is here',
        'News from {company}',
    ],
    promo: [
        '{discount} off everything, this week only',
        'Our biggest sale of the year starts now',
        '{{first_name}}, your {discount} discount is inside',
        'Ends Sunday: {discount} off',
        'Prices this low won’t last',
    ],
    event: [
        'You’re invited: join us live',
        'Save your seat, {{first_name}}',
        'Reserve your spot before it fills up',
        'Join {company} for a live session',
        'Your invitation is waiting',
    ],
    announcement: [
        'Introducing {product}',
        'Something new from {company}',
        'Big news: {product} is here',
        'The update you asked for',
        'What’s new at {company}',
    ],
    'abandoned-cart': [
        'You left something behind',
        'Still thinking it over?',
        'Your cart is waiting, {{first_name}}',
        'Complete your order before it sells out',
        'Forgot something?',
    ],
    receipt: [
        'Order confirmed: thanks, {{first_name}}',
        'Your receipt from {company}',
        'We’ve received your order',
        'Your order is on its way',
        'Thanks for your purchase',
    ],
    feedback: [
        'How did we do?',
        'Got a minute? We’d love your feedback',
        'Tell us what you think, {{first_name}}',
        'Your opinion shapes what we build next',
        'A quick question for you',
    ],
    're-engagement': [
        'We miss you, {{first_name}}',
        'It’s been a while',
        'Here’s what you missed',
        'Come back and see what’s new',
        'A little something to welcome you back',
    ],
    invite: [
        '{{first_name}} invited you to {company}',
        'You’ve been invited',
        'Join {company} today',
        'Your invitation to {company}',
        'Someone thinks you’d love this',
    ],
};

const PREHEADERS: Record<EmailType, string[]> = {
    welcome: ['Three quick things to get you started today.', 'Set up in two minutes, we’ll show you how.'],
    newsletter: [
        'Product news, a customer story and two reads from the team.',
        'Grab a coffee, this one’s a good read.',
    ],
    promo: ['Use code {code} at checkout. Ends Sunday midnight.', 'No exclusions, no catches.'],
    event: ['Seats are limited, grab yours early.', 'One hour of practical ideas you can use straight away.'],
    announcement: ['Faster, simpler and built around your feedback.', 'Here’s what changed and why it matters.'],
    'abandoned-cart': ['Your items are saved and ready when you are.', 'Stock is moving fast.'],
    receipt: ['Tracking details will follow as soon as it ships.', 'Keep this email for your records.'],
    feedback: ['It takes one minute and every answer is read.', 'Honest answers help us do better.'],
    're-engagement': ['A lot has changed since you were last here.', 'Pick up right where you left off.'],
    invite: ['Accept the invitation and start collaborating today.', 'Share your link and you both get a reward.'],
};

export const suggestSubjects = (
    prompt: string,
    options: GenerateOptions = {},
): { subjects: string[]; preheaders: string[]; type: EmailType } => {
    const a = analyse(prompt, options);
    const rnd = mulberry32(prompt.length + 11);
    const fill = (s: string) =>
        s
            .replace(/\{company\}/g, a.company)
            .replace(/\{discount\}/g, a.discount ?? '20%')
            .replace(/\{product\}/g, a.product ?? 'our new release')
            .replace(/\{code\}/g, `SAVE${(a.discount ?? '20%').replace('%', '')}`);
    const shuffle = <T>(items: T[]) => [...items].sort(() => rnd() - 0.5);
    return {
        type: a.type,
        subjects: shuffle(SUBJECTS[a.type]).map(fill),
        preheaders: PREHEADERS[a.type].map(fill),
    };
};
