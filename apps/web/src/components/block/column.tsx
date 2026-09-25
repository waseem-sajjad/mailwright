import type { CanvasProperties, ColumnNode, RowNode } from '@/types';
import { borderCss, paddingCss, rgbaToCss } from '@/utils';
import { Container } from '@/components/container';
import { Slot } from '@/components/slot';

import { Content } from './content';

export const Column: React.FC<{
    column: ColumnNode;
    row: RowNode;
    canvas: CanvasProperties;
}> = ({ column, canvas }) => {
    const p = column.properties;
    const justify = { top: 'flex-start', middle: 'center', bottom: 'flex-end' };

    return (
        <Container
            style={{
                backgroundColor: rgbaToCss(p.backgroundColor),
                border: borderCss(p.border),
                borderRadius: p.border.radius,
                height: '100%',
            }}
            toolbar="bottom"
            name="Column"
            id={column.id}
            kind="column"
        >
            <div
                style={{
                    padding: paddingCss(p.padding),
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: justify[p.verticalAlign],
                    minHeight: '100%',
                    height: '100%',
                }}
            >
                {column.children.length === 0 ? (
                    <Slot
                        placeholder="Drop content here"
                        parentId={column.id}
                        kind="content"
                        index={0}
                    />
                ) : (
                    <>
                        {column.children.map((child, index) => (
                            <div key={child.id}>
                                <Slot
                                    parentId={column.id}
                                    kind="content"
                                    index={index}
                                />
                                <Content canvas={canvas} node={child} />
                            </div>
                        ))}
                        <Slot
                            index={column.children.length}
                            parentId={column.id}
                            kind="content"
                        />
                    </>
                )}
            </div>
        </Container>
    );
};
