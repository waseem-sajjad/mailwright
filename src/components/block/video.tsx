import { Play } from 'lucide-react';

import type { VideoNode } from '@/types';
import { paddingCss, PLACEHOLDER_IMAGE, videoThumbnail } from '@/utils';

export const Video: React.FC<{ node: VideoNode; contentWidth: number }> = ({
    node,
    contentWidth,
}) => {
    const p = node.properties;
    const thumb =
        (p.autoThumbnail ? videoThumbnail(p.url) : p.thumbnail) ||
        p.thumbnail ||
        PLACEHOLDER_IMAGE;
    const px = Math.round((contentWidth * p.width) / 100);
    return (
        <div style={{ padding: paddingCss(p.padding), textAlign: p.align }}>
            <div
                style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: px,
                    maxWidth: '100%',
                    verticalAlign: 'middle',
                }}
            >
                <img
                    style={{ display: 'block', width: '100%', height: 'auto' }}
                    draggable={false}
                    src={thumb}
                    alt={p.alt}
                />
                {p.playButton ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex size-16 items-center justify-center rounded-full bg-black/60 text-white">
                            <Play size={28} fill="currentColor" />
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};
