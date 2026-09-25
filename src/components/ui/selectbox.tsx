import { cn } from '@/utils';

type Option = {
    value: string;
    label: string;
};

export interface SelectBoxProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export const SelectBox: React.FC<SelectBoxProps> = ({
    options,
    value,
    onChange,
    className,
}) => (
    <select
        className={cn(
            'cursor-pointer rounded-xs border border-gray-300 bg-white px-2.5 py-2 text-xs font-medium text-gray-600',
            className,
        )}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Select"
        value={value}
    >
        {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
);
