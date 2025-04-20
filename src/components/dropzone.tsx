import { useDndMonitor, useDroppable } from '@dnd-kit/core';

import type { BaseComponent, RowComponentType } from '@/types';
import { RowComponent } from '@/utils/components';
import { cn } from '@/utils';

interface DropZoneProps {
    zoneType: 'canvas' | 'row' | 'column';
    component: BaseComponent<any>;
    hidden: boolean;
}

const CanvasDropZone: React.FC<{
    component: RowComponentType;
}> = ({ component }) => {
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

export const DropZone: React.FC<DropZoneProps> = ({
    component,
    zoneType,
    hidden,
}) => {
    if (hidden === true) return null;
    if (zoneType === 'canvas') return <CanvasDropZone component={component} />;
    return null;
};
