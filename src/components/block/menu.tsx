import type { CanvasProperties, MenuNode } from '@/types';
import { paddingCss, rgbaToCss } from '@/utils';

import { TagText } from './tagtext';

export const Menu: React.FC<{ node: MenuNode; canvas: CanvasProperties }> = ({
    node,
    canvas,
}) => {
    const p = node.properties;
    const justify = { left: 'flex-start', center: 'center', right: 'flex-end' };
    const color = p.inheritColor ? rgbaToCss(canvas.color) : rgbaToCss(p.color);
    return (
        <div style={{ padding: paddingCss(p.padding) }}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: p.layout === 'vertical' ? 'column' : 'row',
                    alignItems:
                        p.layout === 'vertical' ? justify[p.align] : 'center',
                    justifyContent: justify[p.align],
                    flexWrap: 'wrap',
                    fontFamily: canvas.fontFamily,
                    fontSize: p.fontSize,
                    fontWeight: p.fontWeight,
                    color,
                }}
            >
                {p.items.map((item, index) => (
                    <span
                        style={{ display: 'inline-flex', alignItems: 'center' }}
                        key={item.id}
                    >
                        <span style={{ padding: paddingCss(p.itemPadding) }}>
                            <TagText text={item.text || 'Link'} />
                        </span>
                        {p.separator &&
                        p.layout === 'horizontal' &&
                        index < p.items.length - 1 ? (
                            <span
                                style={{ padding: paddingCss(p.itemPadding) }}
                            >
                                {p.separator}
                            </span>
                        ) : null}
                    </span>
                ))}
            </div>
        </div>
    );
};
