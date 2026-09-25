import { useState } from 'react';

import type { ImageNode } from '@/types';
import { cn, paddingCss, PLACEHOLDER_IMAGE, readFileAsDataUrl } from '@/utils';
import { useEmail } from '@/hooks';

export const Image: React.FC<{ node: ImageNode; contentWidth: number }> = ({
    node,
    contentWidth,
}) => {
    const p = node.properties;
    const px = Math.round((contentWidth * p.width) / 100);
    const updateProperties = useEmail((s) => s.updateProperties);
    const [over, setOver] = useState(false);

    return (
        <div
            className={cn('transition-colors', {
                'bg-blue-100 outline-2 outline-blue-400 outline-dashed': over,
            })}
            onDragOver={(e) => {
                if (e.dataTransfer.types.includes('Files')) {
                    e.preventDefault();
                    setOver(true);
                }
            }}
            onDragLeave={() => setOver(false)}
            onDrop={async (e) => {
                setOver(false);
                const file = e.dataTransfer.files?.[0];
                if (!file || !file.type.startsWith('image/')) return;
                e.preventDefault();
                updateProperties(node.id, {
                    src: await readFileAsDataUrl(file),
                    alt: p.alt || file.name,
                });
            }}
            style={{ padding: paddingCss(p.padding), textAlign: p.align }}
            aria-hidden
        >
            <img
                style={{
                    display: 'inline-block',
                    width: p.autoWidth ? 'auto' : px,
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: p.borderRadius,
                    verticalAlign: 'middle',
                }}
                src={p.src || PLACEHOLDER_IMAGE}
                alt={p.alt}
                draggable={false}
            />
        </div>
    );
};
