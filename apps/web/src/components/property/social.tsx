import { Plus, Trash2 } from 'lucide-react';

import { useNodeProps } from '@/hooks';
import type { SocialItem, SocialNetwork, SocialNode } from '@/types';
import {
    AlignGroup,
    Button,
    Divider,
    Field,
    Input,
    SelectBox,
    Updown,
} from '@/components/ui';
import { SOCIAL_NETWORKS, socialItem } from '@/utils';

import { PaddingField } from './shared';

const networkOptions = (Object.keys(SOCIAL_NETWORKS) as SocialNetwork[]).map(
    (key) => ({ value: key, label: SOCIAL_NETWORKS[key].label }),
);

export const SocialProperty: React.FC<{ node: SocialNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    const updateItem = (
        id: string,
        partial: Partial<SocialItem>,
        transient = false,
    ) => {
        const items = p.items.map((item) =>
            item.id === id ? { ...item, ...partial } : item,
        );
        if (transient) setTransient({ items });
        else set({ items });
    };

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field label="Networks" stacked>
                <div className="flex flex-col gap-3">
                    {p.items.map((item) => (
                        <div
                            className="flex flex-col gap-2 rounded-xs border border-gray-200 p-2"
                            key={item.id}
                        >
                            <div className="flex items-center gap-2">
                                <SelectBox
                                    onChange={(network) =>
                                        updateItem(item.id, {
                                            network: network as SocialNetwork,
                                        })
                                    }
                                    options={networkOptions}
                                    value={item.network}
                                    className="flex-1"
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
                                    aria-label="Remove network"
                                    type="button"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <Input
                                onChange={(e) =>
                                    updateItem(
                                        item.id,
                                        { href: e.target.value },
                                        true,
                                    )
                                }
                                placeholder="Profile URL"
                                onBlur={commit}
                                value={item.href}
                            />
                            <Input
                                onChange={(e) =>
                                    updateItem(
                                        item.id,
                                        { iconUrl: e.target.value },
                                        true,
                                    )
                                }
                                placeholder="Custom icon image URL (optional)"
                                value={item.iconUrl}
                                onBlur={commit}
                            />
                        </div>
                    ))}
                    <Button
                        onClick={() =>
                            set({ items: [...p.items, socialItem('website')] })
                        }
                        className="w-fit"
                        size="sm"
                    >
                        <Plus size={14} /> Add network
                    </Button>
                </div>
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
            <Field label="Spacing">
                <Updown
                    onChange={(spacing) => set({ spacing })}
                    value={p.spacing}
                    max={60}
                    min={0}
                />
            </Field>
            <Field label="Shape">
                <SelectBox
                    onChange={(shape) =>
                        set({
                            shape: shape as SocialNode['properties']['shape'],
                        })
                    }
                    options={[
                        { label: 'Circle', value: 'circle' },
                        { label: 'Rounded', value: 'rounded' },
                        { label: 'Square', value: 'square' },
                    ]}
                    value={p.shape}
                />
            </Field>
            <Field label="Alignment">
                <AlignGroup
                    onChange={(align) => set({ align })}
                    value={p.align}
                />
            </Field>
            <Divider />
            <PaddingField node={node} />
        </div>
    );
};
