import { cn } from '@/utils';

export type TextareaProps = React.ComponentPropsWithRef<'textarea'>;

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => (
    <textarea
        className={cn(
            'min-h-24 w-full resize-y rounded-xs border border-gray-300 px-2.5 py-2 font-mono text-xs outline-0 focus:border-blue-400',
            className,
        )}
        {...props}
    />
);
