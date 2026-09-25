import { useNodeProps } from '@/hooks';
import type { HtmlNode } from '@/types';
import { Divider, Field, Textarea } from '@/components/ui';

import { PaddingField } from './shared';

export const HtmlProperty: React.FC<{ node: HtmlNode }> = ({ node }) => {
    const { p, setTransient, commit } = useNodeProps(node);

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field
                hint="Inline styles only. Scripts are stripped by email clients."
                label="HTML"
                stacked
            >
                <Textarea
                    onChange={(e) => setTransient({ html: e.target.value })}
                    className="min-h-48"
                    spellCheck={false}
                    onBlur={commit}
                    value={p.html}
                />
            </Field>
            <Divider />
            <PaddingField node={node} />
        </div>
    );
};
