import { Plus, Trash2 } from 'lucide-react';

import { useNodeProps } from '@/hooks';
import type { ListNode } from '@/types';
import {
    AlignGroup,
    Button,
    CheckBox,
    Divider,
    Field,
    Input,
    Updown,
} from '@/components/ui';

import { ColorField, PaddingField } from './shared';

export const ListProperty: React.FC<{ node: ListNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    const updateItem = (index: number, value: string) => {
        const items = [...p.items];
        items[index] = value;
        setTransient({ items });
    };

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field label="Items" stacked>
                <div className="flex flex-col gap-2">
                    {p.items.map((item, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <div className="flex items-center gap-2" key={index}>
                            <Input
                                onChange={(e) =>
                                    updateItem(index, e.target.value)
                                }
                                onBlur={commit}
                                value={item}
                            />
                            <button
                                className="cursor-pointer p-1 text-gray-400 hover:text-red-500 disabled:opacity-30"
                                onClick={() =>
                                    set({
                                        items: p.items.filter(
                                            (_, i) => i !== index,
                                        ),
                                    })
                                }
                                disabled={p.items.length <= 1}
                                aria-label="Remove item"
                                type="button"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    <Button
                        onClick={() => set({ items: [...p.items, 'New item'] })}
                        className="w-fit"
                        size="sm"
                    >
                        <Plus size={14} /> Add item
                    </Button>
                </div>
            </Field>
            <Divider />
            <Field label="Numbered">
                <CheckBox
                    onChange={(ordered) => set({ ordered })}
                    checked={p.ordered}
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
                    max={48}
                    min={8}
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
