import type { QuoteNode } from '@/types';
import {
    AlignGroup,
    CheckBox,
    Divider,
    Field,
    Input,
    TagInput,
    Textarea,
    Updown,
} from '@/components/ui';
import { useNodeProps } from '@/hooks';

import { ColorField, PaddingField } from './shared';

export const QuoteProperty: React.FC<{ node: QuoteNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field label="Quote" stacked>
                <Textarea
                    onChange={(e) => setTransient({ text: e.target.value })}
                    className="min-h-20 font-sans"
                    onBlur={commit}
                    value={p.text}
                />
            </Field>
            <Field label="Author" stacked>
                <TagInput
                    onValueChange={(author) => setTransient({ author })}
                    onBlur={commit}
                    value={p.author}
                />
            </Field>
            <Field label="Role / Company" stacked>
                <Input
                    onChange={(e) => setTransient({ role: e.target.value })}
                    onBlur={commit}
                    value={p.role}
                />
            </Field>
            <Field label="Avatar URL" hint="Optional" stacked>
                <Input
                    onChange={(e) => setTransient({ avatar: e.target.value })}
                    placeholder="https://…/photo.jpg"
                    onBlur={commit}
                    value={p.avatar}
                />
            </Field>
            <Field label="Star Rating" hint="0 hides the stars">
                <Updown
                    onChange={(rating) => set({ rating })}
                    value={p.rating}
                    max={5}
                    min={0}
                    unit="★"
                />
            </Field>
            <Divider />
            <Field label="Quotation Marks">
                <CheckBox
                    onChange={(showMarks) => set({ showMarks })}
                    checked={p.showMarks}
                />
            </Field>
            <Field label="Italic">
                <CheckBox
                    onChange={(italic) => set({ italic })}
                    checked={p.italic}
                />
            </Field>
            <Field label="Alignment">
                <AlignGroup
                    onChange={(align) => set({ align })}
                    value={p.align}
                />
            </Field>
            <Field label="Font Size">
                <Updown
                    onChange={(fontSize) => set({ fontSize })}
                    value={p.fontSize}
                    max={32}
                    min={10}
                />
            </Field>
            <ColorField
                onChange={(accentColor) => setTransient({ accentColor })}
                label="Accent Colour"
                value={p.accentColor}
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
        </div>
    );
};
