import type { CalloutNode } from '@/types';
import {
    Divider,
    Field,
    Input,
    TagInput,
    Textarea,
    Updown,
} from '@/components/ui';
import { useNodeProps } from '@/hooks';

import { ColorField, PaddingField } from './shared';

const PRESETS: {
    label: string;
    icon: string;
    bg: [number, number, number];
    accent: [number, number, number];
}[] = [
    { label: 'Info', icon: 'ℹ️', bg: [239, 246, 255], accent: [37, 99, 235] },
    {
        label: 'Success',
        icon: '✅',
        bg: [240, 253, 244],
        accent: [22, 163, 74],
    },
    {
        label: 'Warning',
        icon: '⚠️',
        bg: [255, 251, 235],
        accent: [245, 158, 11],
    },
    { label: 'Danger', icon: '⛔', bg: [254, 242, 242], accent: [220, 38, 38] },
];

export const CalloutProperty: React.FC<{ node: CalloutNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field label="Style Preset" stacked>
                <div className="flex flex-wrap gap-2">
                    {PRESETS.map((preset) => (
                        <button
                            className="cursor-pointer rounded-xs border px-2.5 py-1.5 text-xs hover:border-blue-400"
                            style={{
                                backgroundColor: `rgb(${preset.bg.join(',')})`,
                                borderColor: `rgb(${preset.accent.join(',')})`,
                                color: `rgb(${preset.accent.join(',')})`,
                            }}
                            onClick={() =>
                                set({
                                    icon: preset.icon,
                                    backgroundColor: {
                                        r: preset.bg[0],
                                        g: preset.bg[1],
                                        b: preset.bg[2],
                                        a: 1,
                                    },
                                    accentColor: {
                                        r: preset.accent[0],
                                        g: preset.accent[1],
                                        b: preset.accent[2],
                                        a: 1,
                                    },
                                })
                            }
                            key={preset.label}
                            type="button"
                        >
                            {preset.icon} {preset.label}
                        </button>
                    ))}
                </div>
            </Field>
            <Divider />
            <Field label="Icon" hint="Emoji or symbol; leave empty for none">
                <Input
                    onChange={(e) => setTransient({ icon: e.target.value })}
                    className="w-16 text-center"
                    onBlur={commit}
                    value={p.icon}
                />
            </Field>
            <Field label="Title" stacked>
                <TagInput
                    onValueChange={(title) => setTransient({ title })}
                    onBlur={commit}
                    value={p.title}
                />
            </Field>
            <Field label="Text" stacked>
                <Textarea
                    onChange={(e) => setTransient({ text: e.target.value })}
                    className="min-h-16 font-sans"
                    onBlur={commit}
                    value={p.text}
                />
            </Field>
            <Divider />
            <ColorField
                onChange={(backgroundColor) =>
                    setTransient({ backgroundColor })
                }
                label="Background"
                value={p.backgroundColor}
                onCommit={commit}
            />
            <ColorField
                onChange={(accentColor) => setTransient({ accentColor })}
                label="Accent Bar"
                value={p.accentColor}
                onCommit={commit}
            />
            <ColorField
                onChange={(color) => setTransient({ color })}
                label="Text Colour"
                onCommit={commit}
                value={p.color}
            />
            <Field label="Corner Radius">
                <Updown
                    onChange={(radius) => set({ radius })}
                    value={p.radius}
                    max={24}
                    min={0}
                />
            </Field>
            <Field label="Font Size">
                <Updown
                    onChange={(fontSize) => set({ fontSize })}
                    value={p.fontSize}
                    max={24}
                    min={10}
                />
            </Field>
            <Divider />
            <PaddingField node={node} />
        </div>
    );
};
