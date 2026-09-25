import type { CouponNode } from '@/types';
import { AlignGroup, Divider, Field, TagInput, Updown } from '@/components/ui';
import { useNodeProps } from '@/hooks';

import { ColorField, PaddingField } from './shared';

export const CouponProperty: React.FC<{ node: CouponNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field label="Code" stacked>
                <TagInput
                    onValueChange={(code) => setTransient({ code })}
                    className="font-mono tracking-widest uppercase"
                    onBlur={commit}
                    value={p.code}
                />
            </Field>
            <Field label="Label" stacked>
                <TagInput
                    onValueChange={(label) => setTransient({ label })}
                    onBlur={commit}
                    value={p.label}
                />
            </Field>
            <Field label="Description" stacked>
                <TagInput
                    onValueChange={(description) =>
                        setTransient({ description })
                    }
                    value={p.description}
                    onBlur={commit}
                />
            </Field>
            <Divider />
            <Field label="Code Size">
                <Updown
                    onChange={(codeSize) => set({ codeSize })}
                    value={p.codeSize}
                    max={48}
                    min={12}
                />
            </Field>
            <Field label="Alignment">
                <AlignGroup
                    onChange={(align) => set({ align })}
                    value={p.align}
                />
            </Field>
            <ColorField
                onChange={(codeColor) => setTransient({ codeColor })}
                label="Code Colour"
                value={p.codeColor}
                onCommit={commit}
            />
            <ColorField
                onChange={(codeBackground) => setTransient({ codeBackground })}
                label="Code Background"
                value={p.codeBackground}
                onCommit={commit}
            />
            <ColorField
                onChange={(borderColor) => setTransient({ borderColor })}
                label="Border Colour"
                value={p.borderColor}
                onCommit={commit}
            />
            <ColorField
                onChange={(backgroundColor) =>
                    setTransient({ backgroundColor })
                }
                label="Background"
                value={p.backgroundColor}
                onCommit={commit}
            />
            <Divider />
            <PaddingField node={node} />
        </div>
    );
};
