import type { DividerNode } from '@/types';
import { contentAlign, paddingCss, rgbaToCss } from '@/utils';

export const Divider: React.FC<{ node: DividerNode }> = ({ node }) => {
    const p = node.properties;
    return (
        <div style={{ padding: paddingCss(p.padding) }}>
            <div
                style={{
                    borderTop: `${p.thickness}px ${p.style} ${rgbaToCss(p.color)}`,
                    margin: contentAlign(p.align),
                    width: `${p.width}%`,
                }}
            />
        </div>
    );
};
