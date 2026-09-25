import { useDraggable } from '@dnd-kit/core';

import type { ComponentType, DragCardData } from '@/types';
import { cn } from '@/utils';

export type CardProps = {
    cardType?: 'component' | 'sketch';
    icon: React.ReactNode;
    name: ComponentType;
};

const CardBase: React.FC<React.ComponentPropsWithRef<'div'> & CardProps> = ({
    cardType,
    icon,
    name,
    className,
    ...props
}) => (
    <div
        className={cn(
            'z-10 flex h-20 cursor-grab flex-col items-center justify-center gap-1 rounded border border-gray-300 bg-body text-gray-600 transition-shadow duration-300 ease-in-out hover:shadow-sm',
            {
                'border-blue-400 shadow-md': cardType === 'sketch',
            },
            className,
        )}
        {...props}
    >
        <span className="text-2xl text-blue-400">{icon}</span>
        <span className="text-xs font-medium">{name}</span>
    </div>
);

const CardDraggable: React.FC<CardProps> = ({ icon, name }) => {
    const data: DragCardData = {
        type: 'card',
        name,
        kind: (() => {
            if (name === 'Row') return 'row';
            if (name === 'Column') return 'column';
            return 'content';
        })(),
    };
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `card:${name}`,
        data,
    });

    if (isDragging) {
        return (
            <div className="h-20 rounded border border-dashed border-blue-500 bg-blue-50" />
        );
    }

    return (
        <CardBase
            ref={setNodeRef}
            icon={icon}
            name={name}
            {...listeners}
            {...attributes}
        />
    );
};

export const Card: React.FC<CardProps> = ({
    cardType = 'component',
    ...props
}) => {
    if (cardType === 'sketch') {
        return <CardBase cardType={cardType} {...props} />;
    }
    return <CardDraggable {...props} />;
};
