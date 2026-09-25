import type { HtmlNode } from '@/types';
import { paddingCss } from '@/utils';

export const Html: React.FC<{ node: HtmlNode }> = ({ node }) => {
    const p = node.properties;
    return (
        <div
            // Raw HTML is the whole point of this block.
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
                __html:
                    p.html ||
                    '<p style="margin:0;color:#9ca3af;font-size:12px;">Empty HTML block</p>',
            }}
            style={{ padding: paddingCss(p.padding) }}
        />
    );
};
