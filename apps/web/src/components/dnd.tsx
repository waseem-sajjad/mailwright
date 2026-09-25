import type { CollisionDetection, DragEndEvent } from '@dnd-kit/core';
import {
    closestCenter,
    DndContext,
    DragOverlay,
    MouseSensor,
    pointerWithin,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';

import type { DragData, SlotData } from '@/types';
import { useEmail, useSettings } from '@/hooks';
import { blockMeta } from '@/components/blocks';
import { Card } from '@/components/card';

/** Only consider drop targets that accept what is being dragged. */
const collision: CollisionDetection = (args) => {
    const kind = (args.active.data.current as DragData | undefined)?.kind;
    const containers = args.droppableContainers.filter(
        (c) => (c.data.current as SlotData | undefined)?.kind === kind,
    );
    const scoped = { ...args, droppableContainers: containers };
    const within = pointerWithin(scoped);
    if (within.length > 0) return within;
    return closestCenter(scoped);
};

export const Dnd: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { addNode, moveNode, addColumn } = useEmail();
    const { setDragging } = useSettings();
    const [dragData, setDragData] = useState<DragData | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 150, tolerance: 6 },
        }),
    );

    const onDragEnd = (event: DragEndEvent) => {
        setDragging(false);
        setDragData(null);
        const data = event.active.data.current as DragData | undefined;
        const slot = event.over?.data.current as SlotData | undefined;
        if (!data || !slot || slot.kind !== data.kind) return;

        if (data.type === 'card') {
            if (data.name === 'Column') {
                addColumn(slot.parentId);
                return;
            }
            addNode(data.name, slot.parentId, slot.index);
            return;
        }

        moveNode(data.id, slot.parentId, slot.index);
    };

    return (
        <DndContext
            onDragStart={(event) => {
                setDragging(true);
                setDragData(event.active.data.current as DragData);
            }}
            onDragCancel={() => {
                setDragging(false);
                setDragData(null);
            }}
            collisionDetection={collision}
            onDragEnd={onDragEnd}
            sensors={sensors}
        >
            {children}
            <DragOverlay dropAnimation={null}>
                {dragData?.type === 'card' ? (
                    <Card
                        icon={blockMeta[dragData.name].icon}
                        name={dragData.name}
                        cardType="sketch"
                    />
                ) : null}
                {dragData?.type === 'block' ? (
                    <div className="rounded border border-blue-400 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 shadow">
                        Moving block…
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
