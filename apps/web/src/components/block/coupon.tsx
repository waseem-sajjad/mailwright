import type { CanvasProperties, CouponNode } from '@/types';
import { paddingCss, rgbaToCss } from '@/utils';

import { TagText } from './tagtext';

export const Coupon: React.FC<{
    node: CouponNode;
    canvas: CanvasProperties;
}> = ({ node, canvas }) => {
    const p = node.properties;
    return (
        <div style={{ padding: paddingCss(p.padding) }}>
            <div
                style={{
                    border: `2px dashed ${rgbaToCss(p.borderColor)}`,
                    backgroundColor: rgbaToCss(p.backgroundColor),
                    borderRadius: 8,
                    padding: '18px 20px',
                    textAlign: p.align,
                    fontFamily: canvas.fontFamily,
                    color: rgbaToCss(canvas.color),
                }}
            >
                {p.label ? (
                    <div
                        style={{
                            fontSize: 12,
                            letterSpacing: 1,
                            textTransform: 'uppercase',
                            opacity: 0.75,
                        }}
                    >
                        <TagText text={p.label} />
                    </div>
                ) : null}
                <div
                    style={{
                        display: 'inline-block',
                        marginTop: 8,
                        padding: '8px 18px',
                        borderRadius: 6,
                        backgroundColor: rgbaToCss(p.codeBackground),
                        color: rgbaToCss(p.codeColor),
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: p.codeSize,
                        fontWeight: 'bold',
                        letterSpacing: 3,
                    }}
                >
                    <TagText text={p.code} />
                </div>
                {p.description ? (
                    <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
                        <TagText text={p.description} />
                    </div>
                ) : null}
            </div>
        </div>
    );
};
