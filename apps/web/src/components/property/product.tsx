import type { ProductNode } from '@/types';
import {
    AlignGroup,
    BorderEditor,
    Divider,
    Field,
    Input,
    SelectBox,
    TagInput,
    Textarea,
    Updown,
} from '@/components/ui';
import { useNodeProps } from '@/hooks';

import { ColorField, PaddingField } from './shared';

export const ProductProperty: React.FC<{ node: ProductNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field label="Image URL" stacked>
                <Input
                    onChange={(e) => setTransient({ image: e.target.value })}
                    placeholder="https://…/product.jpg"
                    onBlur={commit}
                    value={p.image}
                />
            </Field>
            <Field label="Image Alt Text" stacked>
                <Input
                    onChange={(e) => setTransient({ imageAlt: e.target.value })}
                    onBlur={commit}
                    value={p.imageAlt}
                />
            </Field>
            <Field label="Title" stacked>
                <TagInput
                    onValueChange={(title) => setTransient({ title })}
                    onBlur={commit}
                    value={p.title}
                />
            </Field>
            <Field label="Description" stacked>
                <Textarea
                    onChange={(e) =>
                        setTransient({ description: e.target.value })
                    }
                    className="min-h-16 font-sans"
                    value={p.description}
                    onBlur={commit}
                />
            </Field>
            <div className="grid grid-cols-2 gap-3 px-4">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-600">
                        Price
                    </span>
                    <Input
                        onChange={(e) =>
                            setTransient({ price: e.target.value })
                        }
                        onBlur={commit}
                        value={p.price}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-600">
                        Old Price
                    </span>
                    <Input
                        onChange={(e) =>
                            setTransient({ oldPrice: e.target.value })
                        }
                        placeholder="optional"
                        value={p.oldPrice}
                        onBlur={commit}
                    />
                </div>
            </div>
            <Divider />
            <Field label="Button Label" stacked>
                <TagInput
                    onValueChange={(buttonText) => setTransient({ buttonText })}
                    onBlur={commit}
                    value={p.buttonText}
                />
            </Field>
            <Field label="Button Link" stacked>
                <TagInput
                    onValueChange={(buttonHref) => setTransient({ buttonHref })}
                    placeholder="https://"
                    value={p.buttonHref}
                    onBlur={commit}
                />
            </Field>
            <ColorField
                onChange={(buttonBackground) =>
                    setTransient({ buttonBackground })
                }
                label="Button Background"
                value={p.buttonBackground}
                onCommit={commit}
            />
            <ColorField
                onChange={(buttonColor) => setTransient({ buttonColor })}
                label="Button Text Colour"
                value={p.buttonColor}
                onCommit={commit}
            />
            <Divider />
            <Field label="Layout">
                <SelectBox
                    onChange={(layout) =>
                        set({
                            layout: layout as ProductNode['properties']['layout'],
                        })
                    }
                    options={[
                        { label: 'Image on top', value: 'vertical' },
                        { label: 'Image beside text', value: 'horizontal' },
                    ]}
                    value={p.layout}
                />
            </Field>
            {p.layout === 'horizontal' ? (
                <Field label="Image Width">
                    <Updown
                        onChange={(imageWidth) => set({ imageWidth })}
                        value={p.imageWidth}
                        max={70}
                        min={20}
                        unit="%"
                    />
                </Field>
            ) : (
                <Field label="Text Alignment">
                    <AlignGroup
                        onChange={(align) => set({ align })}
                        value={p.align}
                    />
                </Field>
            )}
            <Field label="Font Size">
                <Updown
                    onChange={(fontSize) => set({ fontSize })}
                    value={p.fontSize}
                    max={24}
                    min={10}
                />
            </Field>
            <ColorField
                onChange={(backgroundColor) =>
                    setTransient({ backgroundColor })
                }
                label="Card Background"
                value={p.backgroundColor}
                onCommit={commit}
            />
            <BorderEditor
                onChange={(border) => setTransient({ border })}
                onCommit={commit}
                value={p.border}
            />
            <Divider />
            <PaddingField node={node} />
        </div>
    );
};
