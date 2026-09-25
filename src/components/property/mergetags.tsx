import { Plus, RotateCcw, Trash2 } from 'lucide-react';

import type { CanvasNode, MergeTag } from '@/types';
import { Button, Field, Input } from '@/components/ui';
import { DEFAULT_MERGE_TAGS } from '@/utils';
import { useNodeProps } from '@/hooks';

/** Editor for the document's merge tags and their preview sample values. */
export const MergeTagsEditor: React.FC<{ node: CanvasNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    const update = (index: number, partial: Partial<MergeTag>) => {
        const mergeTags = p.mergeTags.map((tag, i) =>
            i === index ? { ...tag, ...partial } : tag,
        );
        setTransient({ mergeTags });
    };

    return (
        <Field
            hint="Insert as {{tag}} anywhere. Samples are used in the preview."
            label="Merge Tags"
            stacked
        >
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-1 px-1 text-[10px] font-medium text-gray-400 uppercase">
                    <span>Tag</span>
                    <span>Label</span>
                    <span>Sample</span>
                    <span />
                </div>
                {p.mergeTags.map((tag, index) => (
                    <div
                        className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-1"
                        // Tags can be renamed, so index is the stable key.
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                    >
                        <Input
                            onChange={(e) =>
                                update(index, {
                                    tag: e.target.value.replace(/[^\w.-]/g, ''),
                                })
                            }
                            className="font-mono"
                            onBlur={commit}
                            value={tag.tag}
                        />
                        <Input
                            onChange={(e) =>
                                update(index, { label: e.target.value })
                            }
                            onBlur={commit}
                            value={tag.label}
                        />
                        <Input
                            onChange={(e) =>
                                update(index, { sample: e.target.value })
                            }
                            onBlur={commit}
                            value={tag.sample}
                        />
                        <button
                            className="cursor-pointer p-1 text-gray-400 hover:text-red-500"
                            onClick={() =>
                                set({
                                    mergeTags: p.mergeTags.filter(
                                        (_, i) => i !== index,
                                    ),
                                })
                            }
                            aria-label="Remove tag"
                            type="button"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                <div className="flex gap-2">
                    <Button
                        onClick={() =>
                            set({
                                mergeTags: [
                                    ...p.mergeTags,
                                    {
                                        tag: 'new_tag',
                                        label: 'New tag',
                                        sample: '',
                                    },
                                ],
                            })
                        }
                        size="sm"
                    >
                        <Plus size={14} /> Add tag
                    </Button>
                    <Button
                        onClick={() =>
                            set({
                                mergeTags: DEFAULT_MERGE_TAGS.map((t) => ({
                                    ...t,
                                })),
                            })
                        }
                        variant="ghost"
                        size="sm"
                    >
                        <RotateCcw size={14} /> Reset
                    </Button>
                </div>
            </div>
        </Field>
    );
};
