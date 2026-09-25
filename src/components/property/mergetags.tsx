import { AlertCircle, Copy, Plus, RotateCcw, Trash2 } from 'lucide-react';

import type { CanvasNode, MergeTag } from '@/types';
import { Button, Field, Input } from '@/components/ui';
import { cn, copyToClipboard, DEFAULT_MERGE_TAGS, formatTag } from '@/utils';
import { useNodeProps, useSettings } from '@/hooks';

const slugTag = (value: string): string =>
    value
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_.-]/g, '');

const problemFor = (tag: MergeTag, all: MergeTag[]): string | null => {
    if (!tag.tag) return 'Tag name is empty.';
    if (all.filter((t) => t.tag === tag.tag).length > 1) {
        return 'Duplicate tag name.';
    }
    return null;
};

/** Editor for the document's merge tags and their preview sample values. */
export const MergeTagsEditor: React.FC<{ node: CanvasNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);
    const notify = useSettings((s) => s.notify);

    const update = (index: number, partial: Partial<MergeTag>) =>
        setTransient({
            mergeTags: p.mergeTags.map((tag, i) =>
                i === index ? { ...tag, ...partial } : tag,
            ),
        });

    return (
        <Field
            hint="Type {{tag}} in any text, or use the { } button next to link fields. Samples fill the preview."
            label="Merge Tags"
            stacked
        >
            <div className="flex flex-col gap-2">
                {p.mergeTags.map((tag, index) => {
                    const problem = problemFor(tag, p.mergeTags);
                    return (
                        <div
                            className={cn(
                                'flex flex-col gap-2 rounded-xs border border-gray-200 bg-white p-2',
                                { 'border-amber-300': problem },
                            )}
                            // Tags can be renamed, so index is the stable key.
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                        >
                            <div className="flex items-center gap-1.5">
                                <span className="shrink-0 text-[11px] text-gray-400">
                                    {'{{'}
                                </span>
                                <input
                                    className="min-w-0 flex-1 rounded-xs border border-gray-200 bg-gray-50 px-1.5 py-1 font-mono text-xs text-blue-700 outline-none focus:border-blue-400"
                                    onChange={(e) =>
                                        update(index, {
                                            tag: slugTag(e.target.value),
                                        })
                                    }
                                    aria-label="Tag name"
                                    placeholder="tag_name"
                                    spellCheck={false}
                                    onBlur={commit}
                                    value={tag.tag}
                                />
                                <span className="shrink-0 text-[11px] text-gray-400">
                                    {'}}'}
                                </span>
                                <button
                                    className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                                    onClick={async () => {
                                        const text = formatTag(tag.tag);
                                        if (await copyToClipboard(text)) {
                                            notify(`Copied ${text}`);
                                        }
                                    }}
                                    aria-label="Copy tag"
                                    title="Copy tag"
                                    type="button"
                                >
                                    <Copy size={13} />
                                </button>
                                <button
                                    className="cursor-pointer rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                    onClick={() =>
                                        set({
                                            mergeTags: p.mergeTags.filter(
                                                (_, i) => i !== index,
                                            ),
                                        })
                                    }
                                    aria-label="Remove tag"
                                    title="Remove tag"
                                    type="button"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1 text-[10px] font-medium text-gray-400 uppercase">
                                    Label
                                    <Input
                                        aria-label="Tag label"
                                        onChange={(e) =>
                                            update(index, {
                                                label: e.target.value,
                                            })
                                        }
                                        className="normal-case"
                                        placeholder="First name"
                                        onBlur={commit}
                                        value={tag.label}
                                    />
                                </div>
                                <div className="flex flex-col gap-1 text-[10px] font-medium text-gray-400 uppercase">
                                    Sample
                                    <Input
                                        aria-label="Sample value"
                                        onChange={(e) =>
                                            update(index, {
                                                sample: e.target.value,
                                            })
                                        }
                                        className="normal-case"
                                        placeholder="Alex"
                                        onBlur={commit}
                                        value={tag.sample}
                                    />
                                </div>
                            </div>
                            {problem ? (
                                <span className="flex items-center gap-1 text-[11px] text-amber-600">
                                    <AlertCircle size={12} /> {problem}
                                </span>
                            ) : null}
                        </div>
                    );
                })}
                <div className="flex gap-2">
                    <Button
                        onClick={() =>
                            set({
                                mergeTags: [
                                    ...p.mergeTags,
                                    { tag: '', label: '', sample: '' },
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
                        title="Restore the default tag set"
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
