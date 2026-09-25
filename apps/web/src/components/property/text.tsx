import type { TextNode } from '@/types';

import { TypographyFields } from './typography';

export const TextProperty: React.FC<{ node: TextNode }> = ({ node }) => (
    <div className="flex flex-col gap-5 py-5">
        <TypographyFields node={node} />
    </div>
);
