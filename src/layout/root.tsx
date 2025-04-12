import { useDndContext } from '@dnd-kit/core';

import { cn } from '@/utils';

export const Root: React.FC<React.ComponentPropsWithRef<'main'>> = ({
    className,
    children,
    ...props
}) => {
    const { active } = useDndContext();

    return (
        <main
            className={cn(
                'flex h-screen bg-white font-primary',
                {
                    'cursor-grabbing': active?.data?.current?.type === 'card',
                },
                className,
            )}
            {...props}
        >
            {children}
        </main>
    );
};
