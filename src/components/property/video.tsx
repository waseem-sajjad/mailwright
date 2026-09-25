import { useNodeProps } from '@/hooks';
import type { VideoNode } from '@/types';
import {
    AlignGroup,
    CheckBox,
    Divider,
    Field,
    Input,
    Updown,
} from '@/components/ui';

import { PaddingField } from './shared';

export const VideoProperty: React.FC<{ node: VideoNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field
                hint="YouTube or Vimeo links get a poster image automatically"
                label="Video URL"
                stacked
            >
                <Input
                    onChange={(e) => setTransient({ url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=…"
                    onBlur={commit}
                    value={p.url}
                    type="url"
                />
            </Field>
            <Field label="Auto Thumbnail">
                <CheckBox
                    onChange={(autoThumbnail) => set({ autoThumbnail })}
                    checked={p.autoThumbnail}
                />
            </Field>
            {!p.autoThumbnail ? (
                <Field label="Thumbnail URL" stacked>
                    <Input
                        onChange={(e) =>
                            setTransient({ thumbnail: e.target.value })
                        }
                        placeholder="https://…/poster.jpg"
                        value={p.thumbnail}
                        onBlur={commit}
                        type="url"
                    />
                </Field>
            ) : null}
            <Field label="Alt Text" stacked>
                <Input
                    onChange={(e) => setTransient({ alt: e.target.value })}
                    onBlur={commit}
                    value={p.alt}
                />
            </Field>
            <Divider />
            <Field label="Show Play Button">
                <CheckBox
                    onChange={(playButton) => set({ playButton })}
                    checked={p.playButton}
                />
            </Field>
            <Field label="Width">
                <Updown
                    onChange={(width) => set({ width })}
                    value={p.width}
                    max={100}
                    min={10}
                    unit="%"
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
