import { useNodeProps } from '@/hooks';
import type { EmailNode, TextLikeProperties } from '@/types';
import {
    AlignGroup,
    CheckBox,
    Divider,
    Field,
    SelectBox,
    Updown,
} from '@/components/ui';
import { FONT_FAMILIES } from '@/utils';

import { ColorField, PaddingField } from './shared';
import { TextToolbar } from './toolbar';

/** Settings shared by Heading and Text blocks. */
export const TypographyFields: React.FC<{
    node: EmailNode<TextLikeProperties>;
    children?: React.ReactNode;
}> = ({ node, children }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    return (
        <>
            <TextToolbar />
            <Divider />
            {children}
            <Field label="Alignment">
                <AlignGroup
                    onChange={(align) => set({ align })}
                    value={p.align}
                />
            </Field>
            <Divider />
            <Field label="Font Family">
                <SelectBox
                    onChange={(fontFamily) => set({ fontFamily })}
                    value={p.fontFamily}
                    options={FONT_FAMILIES}
                />
            </Field>
            <Field label="Font Size">
                <Updown
                    onChange={(fontSize) => set({ fontSize })}
                    value={p.fontSize}
                    max={120}
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
            <Field label="Line Height">
                <Updown
                    onChange={(lineHeight) => set({ lineHeight })}
                    value={p.lineHeight}
                    step={0.1}
                    max={4}
                    min={0.8}
                    unit="×"
                />
            </Field>
            <Field label="Letter Spacing">
                <Updown
                    onChange={(letterSpacing) => set({ letterSpacing })}
                    value={p.letterSpacing}
                    step={0.5}
                    max={20}
                    min={-5}
                />
            </Field>
            <Divider />
            <Field label="Inherit Body Colour">
                <CheckBox
                    onChange={(inheritColor) => set({ inheritColor })}
                    checked={p.inheritColor}
                />
            </Field>
            {!p.inheritColor ? (
                <ColorField
                    onChange={(color) => setTransient({ color })}
                    label="Text Colour"
                    onCommit={commit}
                    value={p.color}
                />
            ) : null}
            <Divider />
            <PaddingField node={node} />
        </>
    );
};
