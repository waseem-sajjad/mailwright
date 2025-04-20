import { cn, contentAlign, rgbaToHex } from '@/utils';
import { Container } from '@/components/container';
import type { RowComponentType } from '@/types';
import { useEmail, useSettings } from '@/hooks';

import { Column } from './column';

export const Row: React.FC<{
    row: RowComponentType;
}> = ({ row }) => {
    const { setActive, active } = useEmail();
    const { view } = useSettings();

    if (!row.parent) return null;

    return (
        <Container
            onClick={() => {
                setActive(row);
            }}
            active={row.id === active.id}
            id={row.id}
            name="Row"
            className={cn({
                'flex w-[150%] -translate-x-1/6 flex-col items-center justify-center':
                    view === 'mobile',
            })}
        >
            <div
                className={cn('w-full', {
                    'w-[320px]': view === 'mobile',
                })}
            >
                <div
                    style={{
                        padding: `${row.properties.paddingTop}px ${row.properties.paddingRight}px ${row.properties.paddingBottom}px ${row.properties.paddingLeft}px`,
                        backgroundColor: rgbaToHex(
                            row.properties.backgroundColor,
                        ),
                        margin: contentAlign(row.properties.contentAlign),
                        maxWidth: row.parent.properties.contentWidth,
                    }}
                    className={cn(
                        'flex transition-all duration-300 ease-in-out',
                        {
                            'flex-col':
                                row.properties.stack === true &&
                                view === 'mobile',
                        },
                    )}
                >
                    {row.children?.map((column) => (
                        <div
                            style={{
                                width:
                                    row.properties.stack === true &&
                                    view === 'mobile'
                                        ? '100%'
                                        : column.properties.width,
                            }}
                            key={column.id}
                        >
                            <Column column={column} />
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
};
