import { templates as starters } from '@/utils';

import { templates } from './db.ts';

/** Puts the built-in starter templates into an empty library. */
export const seedStarters = (): number => {
    if (templates.count() > 0) return 0;
    let added = 0;
    starters
        .filter((t) => t.id !== 'blank')
        .forEach((starter) => {
            const root = starter.build();
            templates.create({
                name: starter.name,
                root,
                prompt: null,
                kind: 'starter',
            });
            added += 1;
        });
    return added;
};
