import { useNodeProps } from '@/hooks';
import type { HeadingNode } from '@/types';
import { Field, SelectBox } from '@/components/ui';

import { TypographyFields } from './typography';

export const HeadingProperty: React.FC<{ node: HeadingNode }> = ({ node }) => {
    const { p, set } = useNodeProps(node);

    return (
        <div className="flex flex-col gap-5 py-5">
            <TypographyFields node={node}>
                <Field label="Heading Level">
                    <SelectBox
                        onChange={(level) =>
                            set({
                                level: level as HeadingNode['properties']['level'],
                            })
                        }
                        options={[
                            { label: 'H1', value: 'h1' },
                            { label: 'H2', value: 'h2' },
                            { label: 'H3', value: 'h3' },
                            { label: 'H4', value: 'h4' },
                        ]}
                        value={p.level}
                    />
                </Field>
            </TypographyFields>
        </div>
    );
};
