import { useNodeProps } from '@/hooks';
import type { ButtonNode } from '@/types';
import {
    AlignGroup,
    BorderEditor,
    CheckBox,
    Divider,
    Field,
    SelectBox,
    TagInput,
    Updown,
} from '@/components/ui';

import { ColorField, PaddingField } from './shared';

export const ButtonProperty: React.FC<{ node: ButtonNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field label="Label" stacked>
                <TagInput
                    onValueChange={(text) => setTransient({ text })}
                    onBlur={commit}
                    value={p.text}
                />
            </Field>
            <Field label="Link URL" stacked>
                <TagInput
                    onValueChange={(href) => setTransient({ href })}
                    placeholder="https://"
                    onBlur={commit}
                    value={p.href}
                />
            </Field>
            <Field label="Open In">
                <SelectBox
                    onChange={(target) =>
                        set({
                            target: target as ButtonNode['properties']['target'],
                        })
                    }
                    options={[
                        { label: 'New tab', value: '_blank' },
                        { label: 'Same tab', value: '_self' },
                    ]}
                    value={p.target}
                />
            </Field>
            <Divider />
            <ColorField
                onChange={(backgroundColor) =>
                    setTransient({ backgroundColor })
                }
                label="Background Colour"
                value={p.backgroundColor}
                onCommit={commit}
            />
            <ColorField
                onChange={(color) => setTransient({ color })}
                label="Text Colour"
                onCommit={commit}
                value={p.color}
            />
            <Field label="Font Size">
                <Updown
                    onChange={(fontSize) => set({ fontSize })}
                    value={p.fontSize}
                    max={48}
                    min={8}
                />
            </Field>
            <Field label="Font Weight">
                <SelectBox
                    onChange={(fontWeight) =>
                        set({ fontWeight: fontWeight as 'normal' | 'bold' })
                    }
                    options={[
                        { label: 'Normal', value: 'normal' },
                        { label: 'Bold', value: 'bold' },
                    ]}
                    value={p.fontWeight}
                />
            </Field>
            <Divider />
            <Field label="Alignment">
                <AlignGroup
                    onChange={(align) => set({ align })}
                    value={p.align}
                />
            </Field>
            <Field label="Full Width">
                <CheckBox
                    onChange={(fullWidth) => set({ fullWidth })}
                    checked={p.fullWidth}
                />
            </Field>
            <Divider />
            <BorderEditor
                onChange={(border) => setTransient({ border })}
                onCommit={commit}
                value={p.border}
            />
            <Divider />
            <PaddingField
                label="Button Padding"
                linkKey="innerPaddingLink"
                valueKey="innerPadding"
                node={node}
            />
            <Divider />
            <PaddingField label="Outer Padding" node={node} />
        </div>
    );
};
