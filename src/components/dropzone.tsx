import { useDndMonitor, useDroppable } from '@dnd-kit/core';

import type { CanvasComponentType } from '@/types';
import { RowComponent } from '@/utils/components';
import { cn } from '@/utils';

interface DropZoneProps {
    component: CanvasComponentType;
}

export const DropZone: React.FC<DropZoneProps> = ({ component }) => {
    const { setNodeRef, active, isOver } = useDroppable({
        id: 'canvas',
    });

    useDndMonitor({
        onDragEnd(event) {
            if (
                event.active?.data?.current?.name === 'Row' &&
                event.over?.id === 'canvas'
            ) {
                component.addChild(new RowComponent());
            }
        },
    });

    return (
        <div
            className={cn(
                'flex h-20 w-full items-center justify-center border border-dashed border-blue-500 bg-blue-100 transition-colors duration-100 ease-in-out',
                {
                    'bg-blue-200':
                        isOver && active?.data?.current?.name === 'Row',
                },
            )}
            ref={setNodeRef}
        >
            <span className="font-primary text-xs font-normal text-blue-800">
                No row here. Drag a row from the left.
            </span>
        </div>
    );
};
