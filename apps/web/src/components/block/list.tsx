import type { CanvasProperties, ListNode } from '@/types';
import { decorateTags, paddingCss, rgbaToCss } from '@/utils';

export const List: React.FC<{ node: ListNode; canvas: CanvasProperties }> = ({
    node,
    canvas,
}) => {
    const p = node.properties;
    const Tag = p.ordered ? 'ol' : 'ul';
    const tags = canvas.mergeTags;
    return (
        <div style={{ padding: paddingCss(p.padding) }}>
            <Tag
                style={{
                    margin: 0,
                    paddingLeft: 22,
                    listStyleType: p.ordered ? 'decimal' : 'disc',
                    fontFamily: canvas.fontFamily,
                    fontSize: p.fontSize,
                    lineHeight: p.lineHeight,
                    color: p.inheritColor
                        ? rgbaToCss(canvas.color)
                        : rgbaToCss(p.color),
                    textAlign: p.align,
                }}
            >
                {p.items.map((item, index) => (
                    <li
                        // Items are plain strings and can repeat; index is stable here.
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        style={{ margin: '0 0 4px 0' }}
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{
                            __html: decorateTags(item, tags),
                        }}
                    />
                ))}
            </Tag>
        </div>
    );
};
