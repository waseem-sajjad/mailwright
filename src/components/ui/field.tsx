import { cn } from '@/utils';

interface FieldProps extends React.ComponentPropsWithRef<'div'> {
    label: string;
    /** Stack the control under the label instead of beside it. */
    stacked?: boolean;
    hint?: string;
}

/** A labelled row inside a property panel. */
export const Field: React.FC<FieldProps> = ({
    label,
    stacked = false,
    hint,
    className,
    children,
    ...props
}) => (
    <div
        className={cn(
            'flex px-4',
            stacked ? 'flex-col gap-2' : 'items-center justify-between gap-3',
            className,
        )}
        {...props}
    >
        <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-600">{label}</span>
            {hint ? (
                <span className="text-[11px] text-gray-400">{hint}</span>
            ) : null}
        </div>
        {children}
    </div>
);

export const Divider: React.FC = () => <hr className="mx-4 border-gray-200" />;

export const Section: React.FC<React.PropsWithChildren<{ title?: string }>> = ({
    title,
    children,
}) => (
    <div className="flex flex-col gap-4 py-4">
        {title ? (
            <h5 className="px-4 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                {title}
            </h5>
        ) : null}
        {children}
    </div>
);
