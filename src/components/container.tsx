import { useSettings } from '@/hooks';
import { cn } from '@/utils';

interface ContainerProps extends React.ComponentPropsWithRef<'div'> {
    active: boolean;
    name: string;
    id: string;
}

export const Container: React.FC<ContainerProps> = ({
    id,
    name,
    active,
    onClick,
    className,
    children,
    ...props
}) => {
    const { hover, setHover } = useSettings();

    return (
        <div
            className={cn(
                'relative outline-2 -outline-offset-2 outline-transparent data-[over=true]:bg-blue-400/20 data-[over=true]:outline-blue-400 data-[state=active]:bg-transparent data-[state=active]:outline-blue-400',
                className,
            )}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick?.(e);
            }}
            data-state={active === true ? 'active' : ''}
            onMouseOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setHover(id);
            }}
            onMouseLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setHover('');
            }}
            onFocus={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setHover(id);
            }}
            onBlur={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setHover('');
            }}
            data-over={hover === id}
            aria-hidden
            {...props}
        >
            <div
                data-state={active === true ? 'active' : ''}
                data-over={hover === id}
                className="absolute -bottom-4 left-0 hidden bg-blue-400 px-2 text-xs text-white data-[over=true]:block data-[state=active]:block"
            >
                <span>{name}</span>
            </div>
            {children}
        </div>
    );
};
