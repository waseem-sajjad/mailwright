import type { FooterNode } from '@/types';
import {
    AlignGroup,
    Divider,
    Field,
    TagInput,
    Textarea,
    Updown,
} from '@/components/ui';
import { useNodeProps } from '@/hooks';

import { ColorField, PaddingField } from './shared';

export const FooterProperty: React.FC<{ node: FooterNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field label="Company" stacked>
                <TagInput
                    onValueChange={(company) => setTransient({ company })}
                    onBlur={commit}
                    value={p.company}
                />
            </Field>
            <Field
                label="Postal Address"
                hint="Required by CAN-SPAM and most spam laws"
                stacked
            >
                <TagInput
                    onValueChange={(address) => setTransient({ address })}
                    onBlur={commit}
                    value={p.address}
                />
            </Field>
            <Field label="Reason For Email" stacked>
                <Textarea
                    onChange={(e) => setTransient({ text: e.target.value })}
                    className="min-h-14 font-sans"
                    onBlur={commit}
                    value={p.text}
                />
            </Field>
            <Divider />
            <Field label="Unsubscribe Text" stacked>
                <TagInput
                    onValueChange={(unsubscribeText) =>
                        setTransient({ unsubscribeText })
                    }
                    value={p.unsubscribeText}
                    onBlur={commit}
                />
            </Field>
            <Field
                label="Unsubscribe Link"
                hint="Usually a merge tag from your sending platform"
                stacked
            >
                <TagInput
                    onValueChange={(unsubscribeHref) =>
                        setTransient({ unsubscribeHref })
                    }
                    value={p.unsubscribeHref}
                    onBlur={commit}
                />
            </Field>
            <Field label="Preferences Text" hint="Leave empty to hide" stacked>
                <TagInput
                    onValueChange={(preferencesText) =>
                        setTransient({ preferencesText })
                    }
                    value={p.preferencesText}
                    onBlur={commit}
                />
            </Field>
            <Field label="Preferences Link" stacked>
                <TagInput
                    onValueChange={(preferencesHref) =>
                        setTransient({ preferencesHref })
                    }
                    value={p.preferencesHref}
                    onBlur={commit}
                />
            </Field>
            <Divider />
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
                    max={18}
                    min={9}
                />
            </Field>
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
            <PaddingField node={node} />
        </div>
    );
};
