import type { CanvasProperties, TableNode } from '@/types';
import { contentAlign, decorateTags, paddingCss, rgbaToCss } from '@/utils';

export const Table: React.FC<{ node: TableNode; canvas: CanvasProperties }> = ({
    node,
    canvas,
}) => {
    const p = node.properties;
    const border = `${p.borderWidth}px solid ${rgbaToCss(p.borderColor)}`;
    return (
        <div style={{ padding: paddingCss(p.padding) }}>
            <table
                style={{
                    width: `${p.width}%`,
                    margin: contentAlign(p.align),
                    borderCollapse: 'collapse',
                    fontFamily: canvas.fontFamily,
                    fontSize: p.fontSize,
                    color: rgbaToCss(canvas.color),
                }}
            >
                <tbody>
                    {p.rows.map((row, r) => {
                        const isHeader = p.headerRow && r === 0;
                        const striped =
                            p.stripe &&
                            !isHeader &&
                            (p.headerRow ? r : r + 1) % 2 === 0;
                        return (
                            // Rows are positional; index is the stable key.
                            // eslint-disable-next-line react/no-array-index-key
                            <tr key={r}>
                                {row.map((cell, c) => {
                                    const Cell = isHeader ? 'th' : 'td';
                                    return (
                                        <Cell
                                            style={{
                                                border,
                                                padding: p.cellPadding,
                                                textAlign: 'left',
                                                fontWeight: isHeader
                                                    ? 'bold'
                                                    : 'normal',
                                                backgroundColor: (() => {
                                                    if (isHeader)
                                                        return rgbaToCss(
                                                            p.headerBackground,
                                                        );
                                                    if (striped)
                                                        return rgbaToCss(
                                                            p.stripeColor,
                                                        );
                                                    return 'transparent';
                                                })(),
                                                color: isHeader
                                                    ? rgbaToCss(p.headerColor)
                                                    : undefined,
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: decorateTags(
                                                    cell || '&nbsp;',
                                                    canvas.mergeTags,
                                                ),
                                            }}
                                            // eslint-disable-next-line react/no-array-index-key
                                            key={c}
                                        />
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
