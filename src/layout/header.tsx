import { Monitor, Smartphone } from 'lucide-react';

import { useSettings } from '@/hooks';
import { cn } from '@/utils';

const Button: React.FC<
    React.ComponentPropsWithRef<'button'> & { active?: boolean }
> = ({ className, children, active, ...props }) => (
    <button
        type="button"
        className={cn(
            'h-full cursor-pointer border-gray-300 px-3 text-gray-800 transition-colors duration-300 ease-in-out hover:bg-white',
            {
                'bg-white': active === true,
            },
            className,
        )}
        {...props}
    >
        {children}
    </button>
);

export const Header: React.FC<React.ComponentPropsWithRef<'header'>> = () => {
    const { setView, view } = useSettings();

    return (
        <header className="flex h-10 items-center justify-between border-b border-gray-300 bg-hover">
            <section className="h-full flex-1" />
            <section className="flex h-full flex-1 items-center justify-center">
                <Button
                    onClick={() => setView('desktop')}
                    active={view === 'desktop'}
                    aria-label="Desktop View"
                    className="border-x"
                    title="Desktop View"
                    type="button"
                >
                    <Monitor size={20} />
                </Button>
                <Button
                    onClick={() => setView('mobile')}
                    active={view === 'mobile'}
                    aria-label="Mobile View"
                    className="border-r"
                    title="Mobile View"
                    type="button"
                >
                    <Smartphone size={20} />
                </Button>
            </section>
            <section className="h-full flex-1" />
        </header>
    );
};
