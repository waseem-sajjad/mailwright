import type { CanvasProperties, QuoteNode } from '@/types';
import { paddingCss, rgbaToCss } from '@/utils';

import { TagText } from './tagtext';

const stars = (rating: number): string =>
    '★'.repeat(Math.max(0, Math.min(5, Math.round(rating)))) +
    '☆'.repeat(5 - Math.max(0, Math.min(5, Math.round(rating))));

export const Quote: React.FC<{ node: QuoteNode; canvas: CanvasProperties }> = ({
    node,
    canvas,
}) => {
    const p = node.properties;
    const color = p.inheritColor ? rgbaToCss(canvas.color) : rgbaToCss(p.color);

    return (
        <div style={{ padding: paddingCss(p.padding) }}>
            <div
                style={{
                    backgroundColor: rgbaToCss(p.backgroundColor),
                    borderLeft: `4px solid ${rgbaToCss(p.accentColor)}`,
                    padding: '16px 20px',
                    fontFamily: canvas.fontFamily,
                    color,
                    textAlign: p.align,
                }}
            >
                {p.rating > 0 ? (
                    <div
                        style={{
                            color: '#f59e0b',
                            fontSize: p.fontSize,
                            letterSpacing: 2,
                        }}
                    >
                        {stars(p.rating)}
                    </div>
                ) : null}
                <div
                    style={{
                        fontSize: p.fontSize,
                        lineHeight: 1.5,
                        fontStyle: p.italic ? 'italic' : 'normal',
                        marginTop: p.rating > 0 ? 8 : 0,
                    }}
                >
                    {p.showMarks ? (
                        <span
                            style={{
                                color: rgbaToCss(p.accentColor),
                                fontSize: p.fontSize * 1.6,
                                lineHeight: 0,
                                verticalAlign: '-0.3em',
                                marginRight: 4,
                            }}
                        >
                            &ldquo;
                        </span>
                    ) : null}
                    <TagText text={p.text} />
                    {p.showMarks ? (
                        <span
                            style={{
                                color: rgbaToCss(p.accentColor),
                                fontSize: p.fontSize * 1.6,
                                lineHeight: 0,
                                verticalAlign: '-0.3em',
                                marginLeft: 4,
                            }}
                        >
                            &rdquo;
                        </span>
                    ) : null}
                </div>
                {p.author || p.role ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: {
                                left: 'flex-start',
                                center: 'center',
                                right: 'flex-end',
                            }[p.align],
                            gap: 10,
                            marginTop: 12,
                            fontSize: p.fontSize - 2,
                        }}
                    >
                        {p.avatar ? (
                            <img
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    objectFit: 'cover',
                                }}
                                src={p.avatar}
                                draggable={false}
                                alt=""
                            />
                        ) : null}
                        <div>
                            <div style={{ fontWeight: 'bold' }}>
                                <TagText text={p.author} />
                            </div>
                            {p.role ? (
                                <div style={{ opacity: 0.7 }}>{p.role}</div>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};
