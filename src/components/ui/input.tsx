import { cn } from '@/utils';

export type InputProps = React.ComponentPropsWithRef<'input'>;

export const Input: React.FC<InputProps> = ({ className, ...props }) => (
    <input
        className={cn(
            'w-full rounded-xs border border-gray-300 px-2.5 py-2 text-xs outline-0 focus:border-blue-400',
            className,
        )}
        {...props}
    />
);
