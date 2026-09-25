import type { CanvasProperties, ProductNode } from '@/types';
import { borderCss, paddingCss, PLACEHOLDER_IMAGE, rgbaToCss } from '@/utils';

import { TagText } from './tagtext';

export const Product: React.FC<{
    node: ProductNode;
    canvas: CanvasProperties;
}> = ({ node, canvas }) => {
    const p = node.properties;
    const horizontal = p.layout === 'horizontal';

    return (
        <div style={{ padding: paddingCss(p.padding) }}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: horizontal ? 'row' : 'column',
                    gap: 16,
                    backgroundColor: rgbaToCss(p.backgroundColor),
                    border: borderCss(p.border),
                    borderRadius: p.border.radius,
                    overflow: 'hidden',
                    fontFamily: canvas.fontFamily,
                    fontSize: p.fontSize,
                    color: rgbaToCss(canvas.color),
                    textAlign: horizontal ? 'left' : p.align,
                    padding:
                        p.border.style === 'none' && !p.backgroundColor.a
                            ? 0
                            : 12,
                }}
            >
                <img
                    style={{
                        width: horizontal ? `${p.imageWidth}%` : '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'cover',
                        borderRadius: p.border.radius,
                        flexShrink: 0,
                    }}
                    src={p.image || PLACEHOLDER_IMAGE}
                    draggable={false}
                    alt={p.imageAlt}
                />
                <div style={{ flex: 1 }}>
                    <div
                        style={{ fontWeight: 'bold', fontSize: p.fontSize + 4 }}
                    >
                        <TagText text={p.title} />
                    </div>
                    <div style={{ marginTop: 6, opacity: 0.85 }}>
                        <TagText text={p.description} />
                    </div>
                    <div style={{ marginTop: 10, fontSize: p.fontSize + 2 }}>
                        {p.oldPrice ? (
                            <s style={{ opacity: 0.5, marginRight: 8 }}>
                                {p.oldPrice}
                            </s>
                        ) : null}
                        <strong>{p.price}</strong>
                    </div>
                    {p.buttonText ? (
                        <span
                            style={{
                                display: 'inline-block',
                                marginTop: 12,
                                padding: '10px 20px',
                                borderRadius: 4,
                                backgroundColor: rgbaToCss(p.buttonBackground),
                                color: rgbaToCss(p.buttonColor),
                                fontWeight: 'bold',
                                fontSize: p.fontSize,
                            }}
                        >
                            <TagText text={p.buttonText} />
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
