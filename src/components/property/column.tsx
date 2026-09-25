import { useNodeProps } from '@/hooks';
import type { ColumnNode } from '@/types';
import { BorderEditor, Divider, Field, SelectBox } from '@/components/ui';

import { ColorField, PaddingField } from './shared';

export const ColumnProperty: React.FC<{ node: ColumnNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    return (
        <div className="flex flex-col gap-5 py-5">
            <ColorField
                onChange={(backgroundColor) =>
                    setTransient({ backgroundColor })
                }
                label="Background Colour"
                value={p.backgroundColor}
                onCommit={commit}
            />
            <Field label="Vertical Alignment">
                <SelectBox
                    onChange={(verticalAlign) =>
                        set({
                            verticalAlign:
                                verticalAlign as ColumnNode['properties']['verticalAlign'],
                        })
                    }
                    options={[
                        { label: 'Top', value: 'top' },
                        { label: 'Middle', value: 'middle' },
                        { label: 'Bottom', value: 'bottom' },
                    ]}
                    value={p.verticalAlign}
                />
            </Field>
            <Divider />
            <PaddingField node={node} />
            <Divider />
            <BorderEditor
                onChange={(border) => setTransient({ border })}
                onCommit={commit}
                value={p.border}
            />
            <p className="px-4 text-[11px] text-gray-400">
                Width is controlled from the parent row&apos;s settings.
            </p>
        </div>
    );
};
