import { useNodeProps } from '@/hooks';
import type { CanvasNode } from '@/types';
import { Divider, Field, Input, SelectBox, Updown } from '@/components/ui';
import { FONT_FAMILIES } from '@/utils';

import { MergeTagsEditor } from './mergetags';
import { ColorField } from './shared';

export const CanvasProperty: React.FC<{ node: CanvasNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field label="Email Title" hint="Used as the HTML <title>" stacked>
                <Input
                    onChange={(e) => setTransient({ title: e.target.value })}
                    placeholder="Untitled email"
                    onBlur={commit}
                    value={p.title}
                />
            </Field>
            <Field
                hint="Shown next to the subject in most inboxes"
                label="Preheader Text"
                stacked
            >
                <Input
                    onChange={(e) =>
                        setTransient({ preheaderText: e.target.value })
                    }
                    placeholder="A short summary of this email…"
                    value={p.preheaderText}
                    onBlur={commit}
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
                onChange={(contentBackgroundColor) =>
                    setTransient({ contentBackgroundColor })
                }
                value={p.contentBackgroundColor}
                label="Content Background"
                onCommit={commit}
            />
            <ColorField
                onChange={(color) => setTransient({ color })}
                label="Text Colour"
                onCommit={commit}
                value={p.color}
            />
            <ColorField
                onChange={(linkColor) => setTransient({ linkColor })}
                label="Link Colour"
                value={p.linkColor}
                onCommit={commit}
            />
            <Divider />
            <Field label="Font Family">
                <SelectBox
                    onChange={(fontFamily) => set({ fontFamily })}
                    options={FONT_FAMILIES.filter((f) => f.value !== 'inherit')}
                    value={p.fontFamily}
                />
            </Field>
            <Field label="Content Width">
                <Updown
                    onChange={(contentWidth) => set({ contentWidth })}
                    value={p.contentWidth}
                    max={900}
                    min={320}
                    step={10}
                />
            </Field>
            <Divider />
            <MergeTagsEditor node={node} />
        </div>
    );
};
