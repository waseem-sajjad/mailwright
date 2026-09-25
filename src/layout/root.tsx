import { useSettings } from '@/hooks';
import { cn } from '@/utils';

export const Root: React.FC<React.ComponentPropsWithRef<'main'>> = ({
    className,
    children,
    ...props
}) => {
    const dragging = useSettings((s) => s.dragging);

    return (
        <main
            className={cn(
                'flex h-screen bg-white font-primary',
                { 'cursor-grabbing select-none': dragging },
                className,
            )}
            {...props}
        >
            {children}
        </main>
    );
};
