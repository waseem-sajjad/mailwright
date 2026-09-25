import { useDndContext, useDroppable } from '@dnd-kit/core';

import type { DragData, DropKind, SlotData } from '@/types';
import { cn } from '@/utils';

interface SlotProps {
    kind: DropKind;
    parentId: string;
    index: number;
    /** Render as a large placeholder instead of a thin insertion line. */
    placeholder?: string;
    className?: string;
}

/** Drop target sitting between blocks; expands while a compatible drag is on. */
export const Slot: React.FC<SlotProps> = ({
    kind,
    parentId,
    index,
    placeholder,
    className,
}) => {
    const data: SlotData = { kind, parentId, index };
    const { setNodeRef, isOver } = useDroppable({
        id: `slot:${parentId}:${index}`,
        data,
    });
    const { active } = useDndContext();
    const dragData = active?.data.current as DragData | undefined;
    const compatible = dragData?.kind === kind;

    if (placeholder) {
        return (
            <div
                data-editor-only
                className={cn(
                    'flex min-h-16 w-full items-center justify-center border border-dashed border-blue-400 bg-blue-500/10 text-center font-primary text-xs text-blue-700 transition-colors duration-100',
                    {
                        'border-blue-500 bg-blue-500/25': isOver && compatible,
                        'opacity-40': dragData && !compatible,
                    },
                    className,
                )}
                ref={setNodeRef}
            >
                {placeholder}
            </div>
        );
    }

    return (
        <div
            data-editor-only
            className={cn(
                'relative z-10 w-full transition-all duration-150 ease-out',
                compatible ? 'h-4' : 'h-0',
                className,
            )}
            ref={setNodeRef}
        >
            {compatible ? (
                <div
                    className={cn(
                        'absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-blue-300/60 transition-all',
                        { 'h-2 bg-blue-500': isOver },
                    )}
                />
            ) : null}
        </div>
    );
};
