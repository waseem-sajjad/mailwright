type Option = {
    value: string;
    label: string;
};

export interface SelectBoxProps {
    options: Option[];
    defaultValue?: string;
    onChange?: (value: string) => void;
}

export const SelectBox: React.FC<SelectBoxProps> = ({
    options,
    defaultValue,
    onChange,
}) => (
    <select
        className="cursor-pointer rounded-xs border border-gray-300 bg-white px-2.5 py-2 text-xs font-medium text-gray-600"
        onChange={(e) => onChange?.(e.target.value)}
        defaultValue={defaultValue}
    >
        {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
);
