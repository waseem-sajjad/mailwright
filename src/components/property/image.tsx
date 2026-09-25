import { useNodeProps } from '@/hooks';
import type { ImageNode } from '@/types';
import {
    AlignGroup,
    CheckBox,
    Divider,
    Field,
    Input,
    Updown,
} from '@/components/ui';

import { PaddingField } from './shared';

export const ImageProperty: React.FC<{ node: ImageNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

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
            </Field>
            <Field label="Alt Text" stacked>
                <Input
                    onChange={(e) => setTransient({ alt: e.target.value })}
                    onBlur={commit}
                    value={p.alt}
                />
            </Field>
            <Field label="Link URL" hint="Optional" stacked>
                <Input
                    onChange={(e) => setTransient({ href: e.target.value })}
                    placeholder="https://"
                    onBlur={commit}
                    value={p.href}
                    type="url"
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
