import type { CanvasNode, EmailNode } from '../types';

import { createCanvas, createContent, createRow } from './factory';
import { rgb, uniformPadding } from './helper';

const withProps = <T extends EmailNode>(node: T, props: object): T => ({
    ...node,
    properties: { ...node.properties, ...props },
});

const fill = (row: EmailNode, columns: EmailNode[][]): EmailNode => ({
    ...row,
    children: row.children.map((column, index) => ({
        ...column,
        children: columns[index] ?? [],
    })),
});

export interface Template {
    id: string;
    name: string;
    description: string;
    build: () => CanvasNode;
}

const blank = (): CanvasNode => createCanvas();

const welcome = (): CanvasNode => {
    const canvas = createCanvas();
    const header = withProps(createRow(), {
        contentBackgroundColor: rgb(17, 24, 39),
        padding: { top: 20, right: 0, bottom: 0, left: 0 },
    });
    const hero = createRow();
    const features = createRow([33.33, 33.33, 33.34]);
    const cta = createRow();
    const footer = withProps(createRow(), {
        contentBackgroundColor: rgb(243, 244, 246),
    });

    const logo = withProps(createContent('Heading'), {
        text: 'ACME',
        level: 'h2',
        align: 'center',
        inheritColor: false,
        color: rgb(255, 255, 255),
        letterSpacing: 4,
        padding: uniformPadding(18),
    });
    const menu = withProps(createContent('Menu'), {
        inheritColor: false,
        color: rgb(209, 213, 219),
        fontSize: 13,
    });

    const heroImage = withProps(createContent('Image'), {
        src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
        alt: 'Team working together',
        padding: uniformPadding(0),
    });
    const heroTitle = withProps(createContent('Heading'), {
        text: 'Welcome aboard 👋',
        align: 'center',
        fontSize: 32,
        padding: { top: 30, right: 20, bottom: 10, left: 20 },
    });
    const heroText = withProps(createContent('Text'), {
        text: "We're thrilled to have you. Here are three quick things to get you started today, and a button to jump straight in.",
        align: 'center',
        fontSize: 16,
        padding: { top: 0, right: 40, bottom: 20, left: 40 },
    });

    const feature = (title: string, body: string) => [
        withProps(createContent('Heading'), {
            text: title,
            level: 'h3',
            fontSize: 18,
            align: 'center',
            padding: { top: 10, right: 10, bottom: 4, left: 10 },
        }),
        withProps(createContent('Text'), {
            text: body,
            align: 'center',
            fontSize: 13,
            padding: { top: 0, right: 10, bottom: 10, left: 10 },
        }),
    ];

    const button = withProps(createContent('Button'), {
        text: 'Get started',
        padding: { top: 10, right: 10, bottom: 30, left: 10 },
    });

    const social = createContent('Social');
    const legal = withProps(createContent('Text'), {
        text: 'You are receiving this because you signed up at acme.com.<br />ACME Inc · 123 Example Street · Sydney NSW 2000<br /><a href="#" style="color:#6b7280;">Unsubscribe</a> · <a href="#" style="color:#6b7280;">Preferences</a>',
        align: 'center',
        fontSize: 11,
        inheritColor: false,
        color: rgb(107, 114, 128),
        padding: { top: 0, right: 20, bottom: 20, left: 20 },
    });

    return {
        ...canvas,
        properties: {
            ...canvas.properties,
            title: 'Welcome to ACME',
            preheaderText: 'Three quick things to get you started',
        },
        children: [
            fill(header, [[logo, menu]]),
            fill(hero, [[heroImage, heroTitle, heroText]]),
            fill(features, [
                feature('Set up', 'Connect your account in under two minutes.'),
                feature('Explore', 'Browse templates built by our community.'),
                feature('Share', 'Invite your team and collaborate live.'),
            ]),
            fill(cta, [[button]]),
            fill(footer, [[social, legal]]),
        ],
    };
};

const newsletter = (): CanvasNode => {
    const canvas = createCanvas();
    const masthead = createRow();
    const story = createRow([40, 60]);
    const story2 = createRow([60, 40]);
    const footer = withProps(createRow(), {
        contentBackgroundColor: rgb(17, 24, 39),
    });

    const title = withProps(createContent('Heading'), {
        text: 'The Weekly Digest',
        align: 'center',
        fontSize: 30,
        padding: { top: 30, right: 20, bottom: 4, left: 20 },
    });
    const date = withProps(createContent('Text'), {
        text: 'Issue #42 · September 2026',
        align: 'center',
        fontSize: 12,
        inheritColor: false,
        color: rgb(107, 114, 128),
        padding: { top: 0, right: 20, bottom: 10, left: 20 },
    });
    const rule = createContent('Divider');

    const storyImage = (seed: string) =>
        withProps(createContent('Image'), {
            src: `https://picsum.photos/seed/${seed}/600/400`,
            alt: 'Story image',
            borderRadius: 6,
        });
    const storyCopy = (heading: string) => [
        withProps(createContent('Heading'), {
            text: heading,
            level: 'h3',
            fontSize: 20,
            padding: { top: 10, right: 10, bottom: 4, left: 10 },
        }),
        withProps(createContent('Text'), {
            text: 'A short teaser paragraph that pulls the reader in and makes them want to click through to the full article.',
            fontSize: 14,
            padding: { top: 0, right: 10, bottom: 6, left: 10 },
        }),
        withProps(createContent('Button'), {
            text: 'Read more',
            align: 'left',
            fontSize: 13,
            innerPadding: { top: 8, right: 16, bottom: 8, left: 16 },
        }),
    ];

    const list = withProps(createContent('List'), {
        items: [
            '<strong>Product:</strong> dark mode ships next week',
            '<strong>Community:</strong> 1,000 members and counting',
            '<strong>Events:</strong> join our live Q&amp;A on Thursday',
        ],
    });
    const socials = createContent('Social');
    const legal = withProps(createContent('Text'), {
        text: '© 2026 The Digest · <a href="#" style="color:#9ca3af;">Unsubscribe</a>',
        align: 'center',
        fontSize: 11,
        inheritColor: false,
        color: rgb(156, 163, 175),
        padding: { top: 0, right: 20, bottom: 20, left: 20 },
    });

    return {
        ...canvas,
        properties: {
            ...canvas.properties,
            title: 'The Weekly Digest',
            preheaderText: 'Dark mode, 1,000 members and a live Q&A',
            backgroundColor: rgb(229, 231, 235),
        },
        children: [
            fill(masthead, [[title, date, rule]]),
            fill(story, [
                [storyImage('alpha')],
                storyCopy('Dark mode is here'),
            ]),
            fill(story2, [
                storyCopy('Meet the community'),
                [storyImage('beta')],
            ]),
            fill(createRow(), [
                [
                    withProps(createContent('Heading'), {
                        text: 'In brief',
                        level: 'h3',
                        fontSize: 20,
                    }),
                    list,
                ],
            ]),
            fill(footer, [[socials, legal]]),
        ],
    };
};

const promo = (): CanvasNode => {
    const canvas = createCanvas();
    const hero = withProps(createRow(), {
        contentBackgroundColor: rgb(37, 99, 235),
    });
    const body = createRow();
    const grid = createRow([50, 50]);

    const kicker = withProps(createContent('Text'), {
        text: 'LIMITED TIME',
        align: 'center',
        fontSize: 12,
        letterSpacing: 3,
        fontWeight: 'bold',
        inheritColor: false,
        color: rgb(191, 219, 254),
        padding: { top: 40, right: 20, bottom: 6, left: 20 },
    });
    const big = withProps(createContent('Heading'), {
        text: '40% off everything',
        align: 'center',
        fontSize: 40,
        inheritColor: false,
        color: rgb(255, 255, 255),
        padding: { top: 0, right: 20, bottom: 10, left: 20 },
    });
    const sub = withProps(createContent('Text'), {
        text: 'Use code <strong>SAVE40</strong> at checkout. Offer ends Sunday midnight.',
        align: 'center',
        fontSize: 16,
        inheritColor: false,
        color: rgb(219, 234, 254),
        padding: { top: 0, right: 40, bottom: 20, left: 40 },
    });
    const button = withProps(createContent('Button'), {
        text: 'Shop the sale',
        backgroundColor: rgb(255, 255, 255),
        color: rgb(37, 99, 235),
        padding: { top: 0, right: 10, bottom: 40, left: 10 },
    });

    const product = (seed: string, name: string) => [
        withProps(createContent('Image'), {
            src: `https://picsum.photos/seed/${seed}/500/500`,
            alt: name,
            borderRadius: 8,
        }),
        withProps(createContent('Heading'), {
            text: name,
            level: 'h4',
            fontSize: 16,
            align: 'center',
            padding: { top: 6, right: 10, bottom: 2, left: 10 },
        }),
        withProps(createContent('Text'), {
            text: '<s>$80</s> <strong>$48</strong>',
            align: 'center',
            padding: { top: 0, right: 10, bottom: 10, left: 10 },
        }),
    ];

    const spacer = createContent('Spacer');
    const legal = withProps(createContent('Text'), {
        text: 'Offer valid online only. <a href="#" style="color:#6b7280;">Unsubscribe</a>',
        align: 'center',
        fontSize: 11,
        inheritColor: false,
        color: rgb(107, 114, 128),
    });

    return {
        ...canvas,
        properties: {
            ...canvas.properties,
            title: '40% off everything',
            preheaderText: 'Use code SAVE40 before Sunday',
        },
        children: [
            fill(hero, [[kicker, big, sub, button]]),
            fill(grid, [
                product('shoe', 'Runner Pro'),
                product('bag', 'Weekend Tote'),
            ]),
            fill(body, [[spacer, legal]]),
        ],
    };
};

export const templates: Template[] = [
    {
        id: 'blank',
        name: 'Blank',
        description: 'Start from an empty canvas.',
        build: blank,
    },
    {
        id: 'welcome',
        name: 'Welcome',
        description: 'Onboarding email with hero, three features and a CTA.',
        build: welcome,
    },
    {
        id: 'newsletter',
        name: 'Newsletter',
        description: 'Masthead, alternating image/story rows and a footer.',
        build: newsletter,
    },
    {
        id: 'promo',
        name: 'Promotion',
        description: 'Bold coloured hero with a product grid.',
        build: promo,
    },
];
