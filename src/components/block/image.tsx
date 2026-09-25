import type { ImageNode } from '@/types';
import { paddingCss, PLACEHOLDER_IMAGE } from '@/utils';

export const Image: React.FC<{ node: ImageNode; contentWidth: number }> = ({
    node,
    contentWidth,
}) => {
    const p = node.properties;
    const px = Math.round((contentWidth * p.width) / 100);
    return (
        <div style={{ padding: paddingCss(p.padding), textAlign: p.align }}>
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
