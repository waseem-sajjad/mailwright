import { cn } from '@/utils';

interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md';
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'secondary',
    size = 'md',
    className,
    children,
    type = 'button',
    ...props
}) => (
    <button
        className={cn(
            'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xs border text-xs font-medium transition-colors duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50',
            {
                'border-blue-600 bg-blue-600 text-white hover:bg-blue-700':
                    variant === 'primary',
                'border-gray-300 bg-white text-gray-700 hover:bg-gray-50':
                    variant === 'secondary',
                'border-transparent bg-transparent text-gray-600 hover:bg-gray-100':
                    variant === 'ghost',
                'border-red-200 bg-white text-red-600 hover:bg-red-50':
                    variant === 'danger',
                'px-2 py-1': size === 'sm',
                'px-3 py-2': size === 'md',
            },
            className,
        )}
        // eslint-disable-next-line react/button-has-type
        type={type}
        {...props}
    >
        {children}
    </button>
);
