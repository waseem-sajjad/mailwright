import { cn } from '@/utils';

export interface CheckBoxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    size?: 'sm' | 'md';
}

/**
 * Toggle switch. Implemented as a real `button[role=switch]` so it is
 * keyboard-accessible and never depends on peer/pseudo-element tricks.
 */
export const Switch: React.FC<CheckBoxProps> = ({
    checked,
    onChange,
    disabled = false,
    label = 'Toggle',
    size = 'md',
}) => {
    const track = size === 'sm' ? 'h-4 w-7' : 'h-5 w-9';
    const knob = size === 'sm' ? 'size-3' : 'size-4';
    const shift = size === 'sm' ? 'translate-x-3' : 'translate-x-4';

    return (
        <button
            className={cn(
                'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40',
                track,
                checked ? 'bg-blue-500' : 'bg-gray-300',
            )}
            onClick={() => onChange(!checked)}
            aria-checked={checked}
            disabled={disabled}
            aria-label={label}
            role="switch"
            type="button"
        >
            <span
                className={cn(
                    'pointer-events-none inline-block rounded-full bg-white shadow transition-transform duration-200 ease-in-out',
                    knob,
                    checked ? shift : 'translate-x-0',
                )}
            />
        </button>
    );
};

/** Backwards-compatible name used throughout the property panels. */
export const CheckBox = Switch;
