import { Plus, Trash2 } from 'lucide-react';

import type { IconItem, IconsNode } from '@/types';
import {
    AlignGroup,
    Button,
    Divider,
    Field,
    Input,
    SelectBox,
    TagInput,
    Updown,
} from '@/components/ui';
import { useNodeProps } from '@/hooks';
import { iconItem } from '@/utils';

import { ColorField, PaddingField } from './shared';

export const IconsProperty: React.FC<{ node: IconsNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    const update = (id: string, partial: Partial<IconItem>) =>
        setTransient({
            items: p.items.map((item) =>
                item.id === id ? { ...item, ...partial } : item,
            ),
        });

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field
                hint="Icon can be an emoji or symbol, or a hosted image URL"
                label="Items"
                stacked
            >
                <div className="flex flex-col gap-3">
                    {p.items.map((item) => (
                        <div
                            className="flex flex-col gap-2 rounded-xs border border-gray-200 p-2"
                            key={item.id}
                        >
                            <div className="flex items-center gap-2">
                                <Input
                                    onChange={(e) =>
                                        update(item.id, {
                                            icon: e.target.value,
                                        })
                                    }
                                    className="w-14 text-center"
                                    aria-label="Icon"
                                    onBlur={commit}
                                    value={item.icon}
                                />
                                <TagInput
                                    onValueChange={(title) =>
                                        update(item.id, { title })
                                    }
                                    placeholder="Title"
                                    onBlur={commit}
                                    value={item.title}
                                />
                                <button
                                    className="cursor-pointer p-1 text-gray-400 hover:text-red-500"
                                    onClick={() =>
                                        set({
                                            items: p.items.filter(
                                                (i) => i.id !== item.id,
                                            ),
                                        })
                                    }
                                    aria-label="Remove item"
                                    type="button"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <TagInput
                                onValueChange={(text) =>
                                    update(item.id, { text })
                                }
                                placeholder="Description"
                                onBlur={commit}
                                value={item.text}
                            />
                            <Input
                                onChange={(e) =>
                                    update(item.id, { iconUrl: e.target.value })
                                }
                                placeholder="Icon image URL (optional)"
                                value={item.iconUrl}
                                onBlur={commit}
                            />
                        </div>
                    ))}
                    <Button
                        onClick={() =>
                            set({
                                items: [
                                    ...p.items,
                                    iconItem(
                                        '✓',
                                        'New item',
                                        'Describe it here.',
                                    ),
                                ],
                            })
                        }
                        className="w-fit"
                        size="sm"
                    >
                        <Plus size={14} /> Add item
                    </Button>
                </div>
            </Field>
            <Divider />
            <Field label="Layout">
                <SelectBox
                    onChange={(layout) =>
                        set({
                            layout: layout as IconsNode['properties']['layout'],
                        })
                    }
                    options={[
                        { label: 'Vertical list', value: 'vertical' },
                        { label: 'Horizontal columns', value: 'horizontal' },
                    ]}
                    value={p.layout}
                />
            </Field>
            <Field label="Alignment">
                <AlignGroup
                    onChange={(align) => set({ align })}
                    value={p.align}
                />
            </Field>
            <Field label="Gap">
                <Updown
                    onChange={(gap) => set({ gap })}
                    value={p.gap}
                    max={60}
                    min={0}
                />
            </Field>
            <Divider />
            <Field label="Icon Size">
                <Updown
                    onChange={(iconSize) => set({ iconSize })}
                    value={p.iconSize}
                    max={96}
                    min={16}
                />
            </Field>
            <Field label="Icon Shape">
                <SelectBox
                    onChange={(iconShape) =>
                        set({
                            iconShape:
                                iconShape as IconsNode['properties']['iconShape'],
                        })
                    }
                    options={[
                        { label: 'Circle', value: 'circle' },
                        { label: 'Rounded', value: 'rounded' },
                        { label: 'Square', value: 'square' },
                    ]}
                    value={p.iconShape}
                />
            </Field>
            <ColorField
                onChange={(iconBackground) => setTransient({ iconBackground })}
                label="Icon Background"
                value={p.iconBackground}
                onCommit={commit}
            />
            <ColorField
                onChange={(iconColor) => setTransient({ iconColor })}
                label="Icon Colour"
                value={p.iconColor}
                onCommit={commit}
            />
            <Divider />
            <Field label="Font Size">
                <Updown
                    onChange={(fontSize) => set({ fontSize })}
                    value={p.fontSize}
                    max={32}
                    min={8}
                />
            </Field>
            <Field label="Title Weight">
                <SelectBox
                    onChange={(titleWeight) =>
                        set({ titleWeight: titleWeight as 'normal' | 'bold' })
                    }
                    options={[
                        { label: 'Bold', value: 'bold' },
                        { label: 'Normal', value: 'normal' },
                    ]}
                    value={p.titleWeight}
                />
            </Field>
            <Divider />
            <PaddingField node={node} />
        </div>
    );
};
