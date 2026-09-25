import { useDraggable } from '@dnd-kit/core';
import {
    ChevronDown,
    ChevronUp,
    Copy,
    GripVertical,
    Trash2,
} from 'lucide-react';

import type { DragBlockData, DropKind } from '@/types';
import { useEmail, useSettings } from '@/hooks';
import { cn, findParent } from '@/utils';

interface ContainerProps extends React.ComponentPropsWithRef<'div'> {
    id: string;
    name: string;
    kind: DropKind;
    /** Where the toolbar sits relative to the block. */
    toolbar?: 'top' | 'bottom';
    /** Block is hidden on the current preview device. */
    hidden?: boolean;
}

const ToolbarButton: React.FC<
    React.ComponentPropsWithRef<'button'> & { danger?: boolean }
> = ({ className, danger, children, ...props }) => (
    <button
        className={cn(
            'cursor-pointer p-1',
            danger ? 'hover:bg-red-500' : 'hover:bg-blue-600',
            className,
        )}
        type="button"
        {...props}
    >
        {children}
    </button>
);

/**
 * Wraps every block on the canvas: hover/active outline, name badge and the
 * action toolbar (move, duplicate, delete, drag handle).
 */
export const Container: React.FC<ContainerProps> = ({
    id,
    name,
    kind,
    toolbar = 'top',
    hidden = false,
    className,
    children,
    style,
    ...props
}) => {
    const { hover, setHover, dragging } = useSettings();
    const activeId = useEmail((s) => s.activeId);
    const root = useEmail((s) => s.root);
    const { setActive, removeNode, duplicateNode, moveNode } = useEmail();
    const active = activeId === id;
    const over = hover === id && !dragging;

    const data: DragBlockData = { type: 'block', id, kind };
    const drag = useDraggable({ id: `block:${id}`, data });

    const shift = (direction: -1 | 1) => {
        const location = findParent(root, id);
        if (!location) return;
        const { parent, index } = location;
        if (direction === -1 && index === 0) return;
        if (direction === 1 && index >= parent.children.length - 1) return;
        moveNode(id, parent.id, direction === -1 ? index - 1 : index + 2);
    };

    return (
        <div
            className={cn(
                'group/block relative outline-2 -outline-offset-2 outline-transparent transition-[outline-color] duration-100',
                {
                    'outline-blue-400': active,
                    'outline-blue-300/70': over && !active,
                    'opacity-40': drag.isDragging,
                    'opacity-30 grayscale': hidden,
                },
                className,
            )}
            onClick={(e) => {
                e.stopPropagation();
                setActive(id);
            }}
            onMouseOver={(e) => {
                e.stopPropagation();
                setHover(id);
            }}
            onMouseLeave={(e) => {
                e.stopPropagation();
                setHover('');
            }}
            onFocus={(e) => {
                e.stopPropagation();
                setHover(id);
            }}
            onBlur={(e) => {
                e.stopPropagation();
                setHover('');
            }}
            data-block-id={id}
            style={style}
            aria-hidden
            {...props}
        >
            {(active || over) && !dragging ? (
                <div
                    className={cn(
                        'pointer-events-none absolute right-0 left-0 z-20 flex items-center justify-between',
                        toolbar === 'top' ? '-top-6' : '-bottom-6',
                    )}
                >
                    <span
                        className={cn(
                            'px-2 py-0.5 text-[11px] leading-5 font-medium text-white',
                            active ? 'bg-blue-500' : 'bg-blue-300',
                        )}
                    >
                        {name}
                    </span>
                    {active ? (
                        <div className="pointer-events-auto flex items-center bg-blue-500 text-white">
                            <ToolbarButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    shift(-1);
                                }}
                                aria-label="Move up"
                                title="Move up"
                            >
                                <ChevronUp size={14} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    shift(1);
                                }}
                                aria-label="Move down"
                                title="Move down"
                            >
                                <ChevronDown size={14} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateNode(id);
                                }}
                                title="Duplicate (Ctrl+D)"
                                aria-label="Duplicate"
                            >
                                <Copy size={14} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeNode(id);
                                }}
                                aria-label="Delete"
                                title="Delete (Del)"
                                danger
                            >
                                <Trash2 size={14} />
                            </ToolbarButton>
                            <ToolbarButton
                                className="cursor-grab active:cursor-grabbing"
                                ref={drag.setActivatorNodeRef}
                                aria-label="Drag to move"
                                title="Drag to move"
                                {...drag.listeners}
                                {...drag.attributes}
                            >
                                <GripVertical size={14} />
                            </ToolbarButton>
                        </div>
                    ) : null}
                </div>
            ) : null}
            {hidden ? (
                <span className="pointer-events-none absolute top-1 right-1 z-10 rounded bg-gray-700/80 px-1.5 py-0.5 text-[10px] text-white">
                    Hidden on this device
                </span>
            ) : null}
            <div ref={drag.setNodeRef}>{children}</div>
        </div>
    );
};
