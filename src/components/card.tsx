import { useDraggable } from '@dnd-kit/core';

import { cn } from '@/utils';

export type CardProps = {
    component?: 'component' | 'layout';
    cardType?: 'component' | 'sketch';
    icon: React.ReactNode;
    name: string;
};

const CardBase: React.FC<React.ComponentPropsWithRef<'div'> & CardProps> = ({
    cardType,
    icon,
    name,
    ...props
}) => (
    <div
        className={cn(
            'z-10 flex h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded border border-gray-300 bg-body text-gray-600 transition-shadow duration-300 ease-in-out hover:shadow-sm',
            {
                'border-blue-400 shadow': cardType === 'sketch',
            },
        )}
        {...props}
    >
        <span className="text-2xl text-blue-400">{icon}</span>
        <span className="text-xs font-medium">{name}</span>
    </div>
);

const CardComponent: React.FC<CardProps> = ({
    component = 'component',
    cardType = 'component',
    icon,
    name,
}) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        data: { name, icon, cardType, component, type: 'card' },
        id: name,
    });

    if (isDragging) {
        return (
            <div className="h-20 rounded border border-dashed border-blue-500 bg-blue-50" />
        );
    }

    return (
        <CardBase
            component={component}
            cardType={cardType}
            ref={setNodeRef}
            icon={icon}
            name={name}
            {...listeners}
            {...attributes}
        />
    );
};

export const Card: React.FC<CardProps> = ({
    component = 'component',
    cardType = 'component',
    ...props
}) => {
    if (cardType === 'sketch') {
        return (
            <CardBase component={component} cardType={cardType} {...props} />
        );
    }
    return (
        <CardComponent component={component} cardType={cardType} {...props} />
    );
};
