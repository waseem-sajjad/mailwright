/**
 * Writes src/templates/gallery.json: 20 professional templates designed by
 * Gemini from curated briefs. Run once with a GEMINI_API_KEY in .env, commit
 * the JSON, and every fresh database seeds the same gallery.
 *
 *   pnpm build:gallery                        # regenerate all
 *   pnpm build:gallery -- --only "Black Friday"   # regenerate matching names
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { NestFactory } from '@nestjs/core';

import { AiService } from '../ai/ai.service';
import { parseDsl } from '../ai/engine/dsl';
import { AppModule } from '../app.module';
import gallery from '../templates/gallery.json';

interface Brief {
    name: string;
    prompt: string;
    type: string;
    tone: string;
    size: 'standard' | 'large';
}

interface Entry {
    name: string;
    prompt: string;
    dsl: string;
}

const BRIEFS: Brief[] = [
    {
        name: 'SaaS onboarding welcome',
        type: 'welcome',
        tone: 'professional',
        size: 'large',
        prompt: 'Welcome email for Lumen Labs, a B2B analytics SaaS, sent right after sign-up. Goal: get the new user to connect their first data source. Include three setup steps, a feature grid, a customer quote from a data lead at a mid-size retailer, a support callout and a closing call to action. Brand colour #1d4ed8.',
    },
    {
        name: 'E-commerce flash sale',
        type: 'promo',
        tone: 'urgent',
        size: 'large',
        prompt: 'Flash sale email for Northwind Outdoor, an online outdoor-gear store: 30% off everything for 48 hours, code FLASH30, ends Sunday midnight. Feature four products (a 3-season tent, a down jacket, trail runners, a 65 L pack) with prices and old prices, a features row about free shipping, returns and expert support, a coupon block and an urgency band. Brand colour #ea580c.',
    },
    {
        name: 'Fashion lookbook newsletter',
        type: 'newsletter',
        tone: 'playful',
        size: 'large',
        prompt: 'Monthly lookbook newsletter for Atelier Mira, a womenswear label: the autumn edit. Lead story about the new wool coat, two secondary stories (knitwear, accessories) in 1-2 and 2-1 layouts, a styling-tips list, a quote from the creative director, a product row with two pieces and a closing invitation to book a styling appointment. Brand colour #7c2d12.',
    },
    {
        name: 'Restaurant reservation confirmation',
        type: 'receipt',
        tone: 'professional',
        size: 'standard',
        prompt: 'Reservation confirmation email for Bluebird Bistro. Include a table with date, time, party size and table type, a callout about the 15-minute grace policy and dietary requests, a short what-to-expect paragraph, a button to modify the booking, and the address with parking notes.',
    },
    {
        name: 'Real estate new listing',
        type: 'announcement',
        tone: 'professional',
        size: 'large',
        prompt: 'New listing announcement for Harbourline Realty: a three-bedroom waterfront apartment in Manly, Sydney. Hero image, key facts table (price guide, bedrooms, bathrooms, parking, inspection times), a features grid (water views, renovated kitchen, secure parking), an agent quote, a callout about the auction date and a button to book an inspection. Brand colour #0f766e.',
    },
    {
        name: 'Fintech monthly statement',
        type: 'receipt',
        tone: 'professional',
        size: 'standard',
        prompt: 'Monthly account summary email for Ledgerly, a business banking app: balance, money in, money out and fees in a table, a callout about a new invoicing feature, a short security reminder, and a button to download the full statement. Calm, trustworthy tone. Brand colour #0f172a.',
    },
    {
        name: 'Travel deal of the week',
        type: 'promo',
        tone: 'friendly',
        size: 'large',
        prompt: 'Deal-of-the-week email for Wanderlane Travel: Bali 7-night package from $1,299 per person including flights, valid until Friday. Hero, three highlights as icons, a two-column product row (Bali package and a Fiji alternative), a table with what is included, a traveller quote, a coupon EARLYBIRD100 and a strong CTA. Brand colour #0891b2.',
    },
    {
        name: 'Fitness membership win-back',
        type: 're-engagement',
        tone: 'friendly',
        size: 'large',
        prompt: 'Win-back email for Pulse Fitness Club to members who cancelled six months ago: what is new (new studio, 24/7 access, new classes), a welcome-back offer of the first month free with code COMEBACK, a features grid, a member quote, a class schedule table and a CTA to reactivate. Brand colour #dc2626.',
    },
    {
        name: 'Non-profit fundraising appeal',
        type: 'announcement',
        tone: 'friendly',
        size: 'large',
        prompt: 'Year-end fundraising appeal for Bright Futures Foundation, which funds after-school programs. Tell one specific student story, show impact numbers in a table (meals, tutoring hours, laptops), a three-icon row on how gifts are used, a donor quote, a callout that gifts are matched until 31 December, and a Donate button. Warm, respectful, no guilt tripping. Brand colour #7c3aed.',
    },
    {
        name: 'Webinar invitation',
        type: 'event',
        tone: 'professional',
        size: 'large',
        prompt: 'Webinar invitation from Lumen Labs: "Forecasting demand with first-party data", Thursday 12 March at 11:00 AEDT, 45 minutes plus Q&A. Speakers table (name, role), three takeaways as icons, an attendee quote from the last session, a callout that a recording is sent to all registrants, and a Register button. Brand colour #1d4ed8.',
    },
    {
        name: 'Product launch announcement',
        type: 'announcement',
        tone: 'professional',
        size: 'large',
        prompt: 'Product launch email for Nimbus, a smart home thermostat by Halo Devices: introduce the second generation with a hero, three headline features, a comparison table versus the first generation, a pre-order product row (Nimbus 2 and the starter bundle), a press quote, a callout about the launch offer and a Pre-order button. Brand colour #0ea5e9.',
    },
    {
        name: 'Abandoned cart reminder',
        type: 'abandoned-cart',
        tone: 'friendly',
        size: 'standard',
        prompt: 'Abandoned cart email for Northwind Outdoor: the customer left a Summit 65 L backpack ($249) and a merino base layer ($89). Gentle reminder, the two products, a reassurance line about free returns, a 10% incentive code STAYWARM valid 48 hours, and one CTA to complete the order. Brand colour #ea580c.',
    },
    {
        name: 'Order confirmation and receipt',
        type: 'receipt',
        tone: 'professional',
        size: 'standard',
        prompt: 'Order confirmation for Atelier Mira: order AM-48213, two items (wool coat $420, silk scarf $95), shipping $12, total $527, paid by card. Order table, delivery estimate callout, a button to track the parcel and a short line about returns within 30 days. Brand colour #7c2d12.',
    },
    {
        name: 'Customer feedback survey',
        type: 'feedback',
        tone: 'friendly',
        size: 'standard',
        prompt: 'Feedback request from Bluebird Bistro two days after a visit: a warm thank-you, why feedback matters, a two-minute survey button, a note that every reply is read by the owner, and a small thank-you offer of a free coffee on the next visit. Brand colour #b45309.',
    },
    {
        name: 'Technology newsletter',
        type: 'newsletter',
        tone: 'professional',
        size: 'large',
        prompt: 'Weekly technology newsletter "The Signal" from Lumen Labs, issue 42: lead story on practical uses of on-device AI, two secondary stories in 1-2 and 2-1 layouts (a data-governance checklist, a customer case study), an "in brief" list of five short items, a reader quote, a callout for an upcoming webinar and a Read-online button. Brand colour #1d4ed8.',
    },
    {
        name: 'Lifestyle newsletter',
        type: 'newsletter',
        tone: 'friendly',
        size: 'large',
        prompt: "Monthly lifestyle newsletter from Bluebird Coffee Roasters: this month's single origin, a brewing guide with a steps list, a two-column product row (beans and a pour-over kit), a customer story, a table of upcoming cupping sessions, a coupon BREW15 and a closing CTA to visit the shop. Brand colour #b45309.",
    },
    {
        name: 'Event ticket confirmation',
        type: 'receipt',
        tone: 'friendly',
        size: 'standard',
        prompt: 'Ticket confirmation for the Harbour Jazz Festival, Saturday 21 February, gates 4 pm: an order table (ticket type, quantity, price), a what-to-bring list, a callout about the digital ticket QR code arriving 24 hours before the event, venue address and a button to add to calendar. Brand colour #4c1d95.',
    },
    {
        name: 'Black Friday campaign',
        type: 'promo',
        tone: 'urgent',
        size: 'large',
        prompt: 'Black Friday email for Halo Devices: up to 40% off smart home products, doorbusters from 6 am Friday, code BF40. Dark, high-contrast header, urgency band, four products with prices and old prices (thermostat, doorbell, indoor camera, smart plug 4-pack), a features row on warranty, shipping and price match, a coupon block and a CTA. Brand colour #0ea5e9.',
    },
    {
        name: 'Online course enrolment',
        type: 'invite',
        tone: 'professional',
        size: 'large',
        prompt: 'Enrolment invitation for the 6-week "Email Marketing Foundations" cohort by Bright Academy starting 6 April: what students learn as a features grid, a weekly syllabus table, an instructor quote, a student testimonial, pricing as two product cards (self-paced and cohort with coaching), a callout about the early-bird deadline and an Enrol button. Brand colour #0f766e.',
    },
    {
        name: 'Annual member renewal',
        type: 'announcement',
        tone: 'professional',
        size: 'large',
        prompt: 'Annual renewal notice for the Australian Gardeners Society: membership expires 30 June, benefits grid (magazine, events, plant sales, insurance), a table of membership tiers with prices, a message from the president as a quote, a callout about the 10% early renewal discount with code RENEW10, and a Renew button. Brand colour #15803d.',
    },
];

const flags = process.argv.slice(2);
const only = flags.includes('--only') ? flags[flags.indexOf('--only') + 1] : null;

const main = async (): Promise<void> => {
    const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
    const ai = app.get(AiService);
    if (!ai.status().ai) throw new Error('GEMINI_API_KEY is not set; the gallery needs Gemini');
    const current = new Map((gallery as Entry[]).map((g) => [g.name, g]));
    for (const brief of BRIEFS) {
        if (only && !brief.name.toLowerCase().includes(only.toLowerCase())) continue;
        process.stdout.write(`${brief.name} … `);
        let done = false;
        for (let attempt = 1; attempt <= 3 && !done; attempt += 1) {
            const result = await ai.generate(
                brief.prompt,
                { type: brief.type as never, tone: brief.tone as never, size: brief.size },
                [],
            );
            const rows = parseDsl(result.dsl).rows.length;
            const minimum = brief.size === 'large' ? 9 : 5;
            if (result.engine === 'gemini' && rows >= minimum) {
                current.set(brief.name, { name: brief.name, prompt: brief.prompt, dsl: result.dsl });
                console.log(`${rows} rows`);
                done = true;
                save(current); // progressive: an interrupted run keeps what it has
            } else {
                console.log(`attempt ${attempt}: ${result.engine}, ${rows} rows, retrying`);
            }
        }
        if (!done) console.log(`  skipped ${brief.name}`);
    }
    console.log(`wrote ${save(current)} templates to ${FILE}`);
    await app.close();
};

const FILE = path.resolve(__dirname, '../templates/gallery.json');

/** Writes the entries in brief order; returns how many. */
const save = (current: Map<string, Entry>): number => {
    const ordered = BRIEFS.map((b) => current.get(b.name)).filter((g): g is Entry => Boolean(g));
    writeFileSync(FILE, `${JSON.stringify(ordered, null, 2)}\n`);
    return ordered.length;
};

main().catch((error: Error) => {
    console.error(error.message);
    process.exit(1);
});
