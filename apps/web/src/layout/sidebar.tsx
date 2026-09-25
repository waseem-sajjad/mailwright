import { cn } from '@/utils';

const Header: React.FC<React.ComponentPropsWithRef<'nav'>> = ({
    className,
    children,
    ...props
}) => (
    <nav
        className={cn('h-10 border-b border-gray-300 bg-white', className)}
        {...props}
    >
        {children}
    </nav>
);

const Content: React.FC<
    React.ComponentPropsWithRef<'section'> & { fill?: boolean }
> = ({ className, children, fill = false, ...props }) => (
    <section
        className={cn(
            'relative h-[calc(100vh-2.5rem)]',
            fill ? 'overflow-hidden' : 'overflow-y-auto',
            className,
        )}
        {...props}
    >
        {fill ? (
            <div className="h-full w-full">{children}</div>
        ) : (
            <div className="absolute top-0 left-0 w-full">{children}</div>
        )}
    </section>
);

interface SidebarComponent
    extends React.FC<
        React.ComponentPropsWithRef<'aside'> & { width?: string }
    > {
    Content: typeof Content;
    Header: typeof Header;
}

export const Sidebar: SidebarComponent = ({
    className,
    children,
    style,
    width,
    ...props
}) => (
    <aside
        className={cn('border-x border-gray-300 bg-white', className)}
        style={{
            width,
            ...style,
        }}
        {...props}
    >
        {children}
    </aside>
);

Sidebar.Content = Content;
Sidebar.Header = Header;
