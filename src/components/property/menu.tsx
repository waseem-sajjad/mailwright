import { Plus, Trash2 } from 'lucide-react';

import { useNodeProps } from '@/hooks';
import type { MenuItem, MenuNode } from '@/types';
import {
    AlignGroup,
    Button,
    CheckBox,
    Divider,
    Field,
    Input,
    SelectBox,
    Updown,
} from '@/components/ui';
import { newId } from '@/utils';

import { ColorField, PaddingField } from './shared';

export const MenuProperty: React.FC<{ node: MenuNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    const updateItem = (id: string, partial: Partial<MenuItem>) =>
        setTransient({
            items: p.items.map((item) =>
                item.id === id ? { ...item, ...partial } : item,
            ),
        });

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field label="Links" stacked>
                <div className="flex flex-col gap-3">
                    {p.items.map((item) => (
                        <div
                            className="flex flex-col gap-2 rounded-xs border border-gray-200 p-2"
                            key={item.id}
                        >
                            <div className="flex items-center gap-2">
                                <Input
                                    onChange={(e) =>
                                        updateItem(item.id, {
                                            text: e.target.value,
                                        })
                                    }
                                    placeholder="Label"
                                    onBlur={commit}
                                    value={item.text}
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
                                    aria-label="Remove link"
                                    type="button"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <Input
                                onChange={(e) =>
                                    updateItem(item.id, {
                                        href: e.target.value,
                                    })
                                }
                                placeholder="https://"
                                onBlur={commit}
                                value={item.href}
                            />
                        </div>
                    ))}
                    <Button
                        onClick={() =>
                            set({
                                items: [
                                    ...p.items,
                                    {
                                        id: newId(),
                                        text: 'Link',
                                        href: 'https://',
                                    },
                                ],
                            })
                        }
                        className="w-fit"
                        size="sm"
                    >
                        <Plus size={14} /> Add link
                    </Button>
                </div>
            </Field>
            <Divider />
            <Field label="Layout">
                <SelectBox
                    onChange={(layout) =>
                        set({
                            layout: layout as MenuNode['properties']['layout'],
                        })
                    }
                    options={[
                        { label: 'Horizontal', value: 'horizontal' },
                        { label: 'Vertical', value: 'vertical' },
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
            {p.layout === 'horizontal' ? (
                <Field label="Separator" hint="e.g. | or •">
                    <Input
                        onChange={(e) =>
                            setTransient({ separator: e.target.value })
                        }
                        className="w-20 text-center"
                        value={p.separator}
                        onBlur={commit}
                    />
                </Field>
            ) : null}
            <Divider />
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
            <PaddingField
                linkKey="itemPaddingLink"
                valueKey="itemPadding"
                label="Link Padding"
                node={node}
            />
            <Divider />
            <PaddingField label="Outer Padding" node={node} />
        </div>
    );
};
