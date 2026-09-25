import { Check, ChevronDown } from 'lucide-react';

import { cn, FONT_FAMILIES } from '@/utils';

import { Menu } from './menu';

interface FontSelectProps {
    value: string;
    onChange: (value: string) => void;
    /** Offer an "Inherit from body" option (blocks, not the canvas). */
    allowInherit?: boolean;
}

const labelFor = (value: string): string =>
    value === 'inherit'
        ? 'Inherit from body'
        : (FONT_FAMILIES.find((f) => f.value === value)?.label ?? value);

/** Font family picker whose options are rendered in their own typeface. */
export const FontSelect: React.FC<FontSelectProps> = ({
    value,
    onChange,
    allowInherit = false,
}) => {
    const groups = ['System', 'Web fonts'] as const;

    return (
        <Menu
            trigger={
                <button
                    className="flex w-44 cursor-pointer items-center justify-between gap-2 rounded-xs border border-gray-300 bg-white px-2.5 py-2 text-left text-xs font-medium text-gray-600 hover:border-blue-400"
                    style={{
                        fontFamily: value === 'inherit' ? undefined : value,
                    }}
                    aria-label="Font family"
                    type="button"
                >
                    <span className="truncate">{labelFor(value)}</span>
                    <ChevronDown className="shrink-0 text-gray-400" size={14} />
                </button>
            }
            className="max-h-80 w-56 overflow-y-auto"
        >
            {allowInherit ? (
                <Menu.Item onSelect={() => onChange('inherit')}>
                    <span className="flex items-center justify-between">
                        Inherit from body
                        {value === 'inherit' ? (
                            <Check className="text-blue-600" size={13} />
                        ) : null}
                    </span>
                </Menu.Item>
            ) : null}
            {groups.map((group) => (
                <div key={group}>
                    <Menu.Label>{group}</Menu.Label>
                    {FONT_FAMILIES.filter((f) => f.group === group).map(
                        (font) => (
                            <Menu.Item
                                onSelect={() => onChange(font.value)}
                                key={font.value}
                            >
                                <span
                                    className={cn(
                                        'flex items-center justify-between text-[13px]',
                                        {
                                            'text-blue-700':
                                                value === font.value,
                                        },
                                    )}
                                    style={{ fontFamily: font.value }}
                                >
                                    {font.label}
                                    {value === font.value ? (
                                        <Check
                                            className="text-blue-600"
                                            size={13}
                                        />
                                    ) : null}
                                </span>
                            </Menu.Item>
                        ),
                    )}
                </div>
            ))}
        </Menu>
    );
};
