import { Minus, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface UpdownProps {
    defaultValue?: number;
    onChange?: (value: number) => void;
    min?: number;
    max?: number;
}

export const Updown: React.FC<UpdownProps> = ({
    defaultValue = 0,
    max,
    min,
    onChange,
}) => {
    const [value, setValue] = useState<number>(defaultValue);

    const handleValue = (val: number) => {
        setValue(val);
        onChange?.(val);
    };

    useMemo(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    return (
        <div className="flex space-x-2 text-xs">
            <div className="flex items-center rounded-xs border border-gray-300">
                <input
                    onChange={(e) => {
                        if (Number.isNaN(Number(e.target.value))) return;

                        if (max && Number(e.target.value) > max) {
                            handleValue(max);
                            return;
                        }

                        handleValue(Number(e.target.value));
                    }}
                    className="w-14 px-1.5 py-2 text-center outline-0"
                    value={value}
                    type="text"
                />
                <button
                    className="border-l border-gray-300 bg-gray-100 px-3 py-2 font-medium text-gray-400"
                    type="button"
                >
                    px
                </button>
            </div>

            <div className="flex items-center rounded-xs border border-gray-300">
                <button
                    className="cursor-pointer p-2 font-medium text-gray-400 hover:bg-body"
                    disabled={!!(value === 0 || (min && value <= min))}
                    onClick={() => handleValue(value - 1)}
                    type="button"
                >
                    <Minus size={16} />
                </button>
                <button
                    className="cursor-pointer border-l border-gray-300 p-2 font-medium text-gray-400 hover:bg-body"
                    onClick={() => handleValue(value + 1)}
                    disabled={!!(max && value >= max)}
                    type="button"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
};
