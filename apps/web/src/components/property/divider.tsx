import { useNodeProps } from '@/hooks';
import type { DividerNode } from '@/types';
import {
    AlignGroup,
    Field,
    Divider as Rule,
    SelectBox,
    Updown,
} from '@/components/ui';

import { ColorField, PaddingField } from './shared';

export const DividerProperty: React.FC<{ node: DividerNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field label="Width">
                <Updown
                    onChange={(width) => set({ width })}
                    value={p.width}
                    max={100}
                    min={5}
                    unit="%"
                />
            </Field>
            <Field label="Thickness">
                <Updown
                    onChange={(thickness) => set({ thickness })}
                    value={p.thickness}
                    max={20}
                    min={1}
                />
            </Field>
            <Field label="Style">
                <SelectBox
                    onChange={(style) =>
                        set({
                            style: style as DividerNode['properties']['style'],
                        })
                    }
                    options={[
                        { label: 'Solid', value: 'solid' },
                        { label: 'Dashed', value: 'dashed' },
                        { label: 'Dotted', value: 'dotted' },
                    ]}
                    value={p.style}
                />
            </Field>
            <ColorField
                onChange={(color) => setTransient({ color })}
                onCommit={commit}
                label="Colour"
                value={p.color}
            />
            <Field label="Alignment">
                <AlignGroup
                    onChange={(align) => set({ align })}
                    value={p.align}
                />
            </Field>
            <Rule />
            <PaddingField node={node} />
        </div>
    );
};
