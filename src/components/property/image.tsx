import { Upload } from 'lucide-react';
import { useRef } from 'react';

import { useNodeProps } from '@/hooks';

import type { ImageNode } from '@/types';
import { readFileAsDataUrl } from '@/utils';
import {
    AlignGroup,
    Button,
    CheckBox,
    Divider,
    Field,
    Input,
    TagInput,
    Updown,
} from '@/components/ui';

import { PaddingField } from './shared';

export const ImageProperty: React.FC<{ node: ImageNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);
    const fileInput = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field
                hint="Images must be hosted online to show in inboxes"
                label="Image URL"
                stacked
            >
                <Input
                    onChange={(e) => setTransient({ src: e.target.value })}
                    placeholder="https://…/image.jpg"
                    onBlur={commit}
                    value={p.src}
                    type="url"
                />
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => fileInput.current?.click()}
                        size="sm"
                    >
                        <Upload size={14} /> Upload for preview
                    </Button>
                    <span className="text-[11px] text-gray-400">
                        Embeds the file; replace with a hosted URL before
                        sending.
                    </span>
                </div>
                <input
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            set({
                                src: await readFileAsDataUrl(file),
                                alt: p.alt || file.name,
                            });
                        }
                        e.target.value = '';
                    }}
                    className="hidden"
                    accept="image/*"
                    ref={fileInput}
                    type="file"
                />
                {p.src.startsWith('data:') ? (
                    <span className="text-[11px] text-amber-600">
                        This image is embedded and will be flagged by pre-flight
                        checks.
                    </span>
                ) : null}
            </Field>
            <Field label="Alt Text" stacked>
                <Input
                    onChange={(e) => setTransient({ alt: e.target.value })}
                    onBlur={commit}
                    value={p.alt}
                />
            </Field>
            <Field label="Link URL" hint="Optional" stacked>
                <TagInput
                    onValueChange={(href) => setTransient({ href })}
                    placeholder="https://"
                    onBlur={commit}
                    value={p.href}
                />
            </Field>
            <Divider />
            <Field label="Auto Width">
                <CheckBox
                    onChange={(autoWidth) => set({ autoWidth })}
                    checked={p.autoWidth}
                />
            </Field>
            {!p.autoWidth ? (
                <Field label="Width">
                    <Updown
                        onChange={(width) => set({ width })}
                        value={p.width}
                        max={100}
                        min={5}
                        unit="%"
                    />
                </Field>
            ) : null}
            <Field label="Alignment">
                <AlignGroup
                    onChange={(align) => set({ align })}
                    value={p.align}
                />
            </Field>
            <Field label="Corner Radius">
                <Updown
                    onChange={(borderRadius) => set({ borderRadius })}
                    value={p.borderRadius}
                    max={200}
                    min={0}
                />
            </Field>
            <Divider />
            <PaddingField node={node} />
        </div>
    );
};
