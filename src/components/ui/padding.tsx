import { Link2, Unlink2 } from 'lucide-react';

import type { Padding as PaddingValue } from '@/types';
import { uniformPadding } from '@/utils';

import { Updown } from './updown';

export interface PaddingProps {
    label?: string;
    value: PaddingValue;
    link: boolean;
    onChange: (padding: PaddingValue) => void;
    onLinkChange: (link: boolean) => void;
}

const SIDES: (keyof PaddingValue)[] = ['top', 'right', 'bottom', 'left'];

export const Padding: React.FC<PaddingProps> = ({
    label = 'Padding',
    value,
    link,
    onChange,
    onLinkChange,
}) => (
    <div className="flex flex-col gap-4 px-4">
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">{label}</span>
            <button
                className="cursor-pointer text-gray-600 hover:text-gray-800"
                onClick={() => onLinkChange(!link)}
                title={link ? 'Unlink sides' : 'Link sides'}
                aria-label="Link padding sides"
                type="button"
            >
                {link ? <Link2 size={16} /> : <Unlink2 size={16} />}
            </button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {SIDES.map((side) => (
                <div className="flex flex-col gap-1" key={side}>
                    <span className="text-xs font-light text-gray-600 capitalize">
                        {side}
                    </span>
                    <Updown
                        onChange={(val) => {
                            if (link) {
                                onChange(uniformPadding(val));
                            } else {
                                onChange({ ...value, [side]: val });
                            }
                        }}
                        value={value[side]}
                        min={0}
                    />
                </div>
            ))}
        </div>
    </div>
);
