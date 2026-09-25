import type { CalloutNode, CanvasProperties } from '@/types';
import { paddingCss, rgbaToCss } from '@/utils';

import { TagText } from './tagtext';

export const Callout: React.FC<{
    node: CalloutNode;
    canvas: CanvasProperties;
}> = ({ node, canvas }) => {
    const p = node.properties;
    return (
        <div style={{ padding: paddingCss(p.padding) }}>
            <div
                style={{
                    display: 'flex',
                    gap: 12,
                    backgroundColor: rgbaToCss(p.backgroundColor),
                    borderLeft: `4px solid ${rgbaToCss(p.accentColor)}`,
                    borderRadius: p.radius,
                    padding: '14px 16px',
                    fontFamily: canvas.fontFamily,
                    fontSize: p.fontSize,
                    color: rgbaToCss(p.color),
                    lineHeight: 1.5,
                }}
            >
                {p.icon ? (
                    <span
                        style={{
                            fontSize: p.fontSize + 6,
                            lineHeight: 1.2,
                            flexShrink: 0,
                        }}
                    >
                        {p.icon}
                    </span>
                ) : null}
                <div>
                    {p.title ? (
                        <div style={{ fontWeight: 'bold', marginBottom: 2 }}>
                            <TagText text={p.title} />
                        </div>
                    ) : null}
                    <div>
                        <TagText text={p.text} />
                    </div>
                </div>
            </div>
        </div>
    );
};
