import type { CanvasProperties, IconsNode } from '@/types';
import { paddingCss, rgbaToCss } from '@/utils';

import { TagText } from './tagtext';

const radiusFor = (
    shape: IconsNode['properties']['iconShape'],
    size: number,
) => {
    if (shape === 'circle') return size / 2;
    if (shape === 'rounded') return 6;
    return 0;
};

export const Icons: React.FC<{ node: IconsNode; canvas: CanvasProperties }> = ({
    node,
    canvas,
}) => {
    const p = node.properties;
    const horizontal = p.layout === 'horizontal';
    const justify = { left: 'flex-start', center: 'center', right: 'flex-end' };
    const radius = radiusFor(p.iconShape, p.iconSize);

    return (
        <div style={{ padding: paddingCss(p.padding) }}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: horizontal ? 'row' : 'column',
                    gap: p.gap,
                    justifyContent: justify[p.align],
                    fontFamily: canvas.fontFamily,
                    fontSize: p.fontSize,
                    color: rgbaToCss(canvas.color),
                }}
            >
                {p.items.map((item) => (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: horizontal ? 'column' : 'row',
                            alignItems: horizontal ? 'center' : 'flex-start',
                            textAlign: horizontal ? 'center' : p.align,
                            gap: 12,
                            flex: horizontal ? 1 : undefined,
                        }}
                        key={item.id}
                    >
                        {item.iconUrl ? (
                            <img
                                style={{
                                    width: p.iconSize,
                                    height: p.iconSize,
                                    borderRadius: radius,
                                    display: 'block',
                                    flexShrink: 0,
                                }}
                                src={item.iconUrl}
                                draggable={false}
                                alt=""
                            />
                        ) : (
                            <span
                                style={{
                                    width: p.iconSize,
                                    height: p.iconSize,
                                    lineHeight: `${p.iconSize}px`,
                                    borderRadius: radius,
                                    backgroundColor: rgbaToCss(
                                        p.iconBackground,
                                    ),
                                    color: rgbaToCss(p.iconColor),
                                    fontSize: Math.round(p.iconSize * 0.5),
                                    textAlign: 'center',
                                    display: 'inline-block',
                                    flexShrink: 0,
                                }}
                            >
                                {item.icon}
                            </span>
                        )}
                        <div>
                            <div style={{ fontWeight: p.titleWeight }}>
                                <TagText text={item.title} />
                            </div>
                            <div style={{ opacity: 0.8, marginTop: 2 }}>
                                <TagText text={item.text} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
