import { useDroppable } from '@dnd-kit/core';

import type { ColumnComponentType } from '@/types';
import { Container } from '@/components/container';
import { cn, rgbaToHex } from '@/utils';
import { useEmail } from '@/hooks';

export const Column: React.FC<{ column: ColumnComponentType }> = ({
    column,
}) => {
    const { setActive, active } = useEmail();
    const dropable = useDroppable({
        id: column.id,
    });

    return (
        <div
            style={{
                backgroundColor: rgbaToHex(column.properties.backgroundColor),
            }}
        >
            <Container
                onClick={() => {
                    setActive(column);
                }}
                active={column.id === active.id}
                id={column.id}
                name="Column"
            >
                <div
                    className={cn(
                        'flex h-20 w-full items-center justify-center border border-dashed border-blue-500 bg-blue-500/15 text-center font-primary text-xs font-normal text-blue-800 transition-colors duration-100 ease-in-out',
                        {
                            'bg-blue-200':
                                dropable.isOver &&
                                dropable.active?.data?.current?.component ===
                                    'component',
                        },
                    )}
                    ref={dropable.setNodeRef}
                >
                    No content here. Drag content from left.
                </div>
            </Container>
        </div>
    );
};
