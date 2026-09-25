import { Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { clamp } from '@/utils';

export interface UpdownProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
}

export const Updown: React.FC<UpdownProps> = ({
    value,
    max = 9999,
    min = -9999,
    step = 1,
    unit = 'px',
    onChange,
}) => {
    const [draft, setDraft] = useState(String(value));

    useEffect(() => {
        setDraft(String(value));
    }, [value]);

    const emit = (next: number) => {
        const safe = clamp(Number.isNaN(next) ? min : next, min, max);
        onChange(Math.round(safe * 100) / 100);
    };

    return (
        <div className="flex space-x-2 text-xs">
            <div className="flex items-center rounded-xs border border-gray-300">
                <input
                    onChange={(e) => {
                        setDraft(e.target.value);
                        const parsed = Number(e.target.value);
                        if (e.target.value !== '' && !Number.isNaN(parsed)) {
                            emit(parsed);
                        }
                    }}
                    onBlur={() => emit(Number(draft))}
                    className="w-14 px-1.5 py-2 text-center outline-0"
                    aria-label="Value"
                    inputMode="decimal"
                    value={draft}
                    type="text"
                />
                <span className="border-l border-gray-300 bg-gray-100 px-2 py-2 font-medium text-gray-400">
                    {unit}
                </span>
            </div>

            <div className="flex items-center rounded-xs border border-gray-300">
                <button
                    className="cursor-pointer p-2 font-medium text-gray-400 hover:bg-body disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => emit(value - step)}
                    disabled={value <= min}
                    aria-label="Decrease"
                    type="button"
                >
                    <Minus size={16} />
                </button>
                <button
                    className="cursor-pointer border-l border-gray-300 p-2 font-medium text-gray-400 hover:bg-body disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => emit(value + step)}
                    disabled={value >= max}
                    aria-label="Increase"
                    type="button"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
};
