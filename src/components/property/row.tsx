import { Plus, Trash2 } from 'lucide-react';

import { useEmail, useNodeProps } from '@/hooks';
import type { ColumnNode, RowNode } from '@/types';
import {
    AlignGroup,
    Button,
    CheckBox,
    Divider,
    Field,
    Input,
    Updown,
} from '@/components/ui';
import { cn, COLUMN_LAYOUTS } from '@/utils';

import { ColorField, PaddingField } from './shared';

export const RowProperty: React.FC<{ node: RowNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);
    const { setRowLayout, addColumn, removeNode, setActive } = useEmail();
    const layoutKey = p.layout.map((w) => Math.round(w)).join('-');

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field label="Columns" stacked>
                <div className="grid grid-cols-2 gap-2">
                    {COLUMN_LAYOUTS.map((layout) => {
                        const key = layout.value
                            .map((w) => Math.round(w))
                            .join('-');
                        return (
                            <button
                                className={cn(
                                    'flex h-9 cursor-pointer items-center gap-0.5 rounded-xs border border-gray-300 p-1 hover:border-blue-400',
                                    {
                                        'border-blue-500 bg-blue-50':
                                            key === layoutKey,
                                    },
                                )}
                                onClick={() =>
                                    setRowLayout(node.id, layout.value)
                                }
                                title={layout.label}
                                key={key}
                                type="button"
                            >
                                {layout.value.map((w, i) => (
                                    <span
                                        className="h-full rounded-[2px] bg-blue-300"
                                        style={{ width: `${w}%` }}
                                        // eslint-disable-next-line react/no-array-index-key
                                        key={i}
                                    />
                                ))}
                            </button>
                        );
                    })}
                </div>
            </Field>
            <Field label="Column widths" stacked>
                <div className="flex flex-col gap-2">
                    {node.children.map((column, index) => (
                        <div
                            className="flex items-center gap-2"
                            key={column.id}
                        >
                            <button
                                className="w-16 cursor-pointer text-left text-xs text-gray-500 hover:text-blue-600"
                                onClick={() => setActive(column.id)}
                                type="button"
                            >
                                Col {index + 1}
                            </button>
                            <Updown
                                onChange={(width) => {
                                    const layout = [...p.layout];
                                    layout[index] = width;
                                    setRowLayout(node.id, layout);
                                }}
                                value={
                                    Math.round(
                                        (column as ColumnNode).properties
                                            .width * 10,
                                    ) / 10
                                }
                                max={100}
                                min={5}
                                unit="%"
                            />
                            <button
                                className="cursor-pointer p-1 text-gray-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                                disabled={node.children.length <= 1}
                                onClick={() => removeNode(column.id)}
                                aria-label="Remove column"
                                title="Remove column"
                                type="button"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    <Button
                        disabled={node.children.length >= 6}
                        onClick={() => addColumn(node.id)}
                        className="w-fit"
                        size="sm"
                    >
                        <Plus size={14} /> Add column
                    </Button>
                </div>
            </Field>
            <Divider />
            <ColorField
                onChange={(backgroundColor) =>
                    setTransient({ backgroundColor })
                }
                label="Row Background"
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
            <Field label="Background Image URL" stacked>
                <Input
                    onChange={(e) =>
                        setTransient({ backgroundImage: e.target.value })
                    }
                    placeholder="https://…/image.jpg"
                    value={p.backgroundImage}
                    onBlur={commit}
                />
            </Field>
            <Divider />
            <Field label="Content Alignment">
                <AlignGroup
                    onChange={(contentAlign) => set({ contentAlign })}
                    value={p.contentAlign}
                />
            </Field>
            <Divider />
            <PaddingField node={node} />
            <Divider />
            <Field label="Stack Columns On Mobile">
                <CheckBox
                    onChange={(stack) => set({ stack })}
                    checked={p.stack}
                />
            </Field>
        </div>
    );
};
