import type { CanvasProperties, ColumnNode, RowNode } from '@/types';
import { cn, contentAlign, paddingCss, rgbaToCss } from '@/utils';
import { Container } from '@/components/container';
import { useSettings } from '@/hooks';

import { Column } from './column';

export const Row: React.FC<{ row: RowNode; canvas: CanvasProperties }> = ({
    row,
    canvas,
}) => {
    const { view } = useSettings();
    const p = row.properties;
    const stacked = p.stack && view === 'mobile';

    return (
        <Container
            style={{
                backgroundColor: rgbaToCss(p.backgroundColor),
                backgroundImage: p.backgroundImage
                    ? `url('${p.backgroundImage}')`
                    : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
            id={row.id}
            kind="row"
            name="Row"
        >
            <div style={{ padding: paddingCss(p.padding) }}>
                <div
                    style={{
                        margin: contentAlign(p.contentAlign),
                        maxWidth: canvas.contentWidth,
                        backgroundColor: rgbaToCss(p.contentBackgroundColor),
                    }}
                    className={cn('flex transition-all duration-300', {
                        'flex-col': stacked,
                    })}
                >
                    {row.children.map((column) => (
                        <div
                            style={{
                                width: stacked
                                    ? '100%'
                                    : `${column.properties.width}%`,
                                flexShrink: 0,
                            }}
                            key={column.id}
                        >
                            <Column
                                column={column as ColumnNode}
                                canvas={canvas}
                                row={row}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
};
