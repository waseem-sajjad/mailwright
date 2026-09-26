import { cn } from '@/utils';

import { Header } from './header';

export const Content: React.FC<React.ComponentPropsWithRef<'div'>> = ({
    children,
    className,
    ...props
}) => (
    <section className="flex min-w-0 flex-1 flex-col">
        <Header />
        <div
            className={cn(
                'h-[calc(100vh-2.5rem)] overflow-y-auto bg-canvas',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    </section>
);
