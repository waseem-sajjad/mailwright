import { Content, Portal, Root, Trigger } from '@radix-ui/react-popover';
import { SketchPicker } from 'react-color';
import { Slash } from 'lucide-react';

import type { RGBColor } from '@/types';

export interface ColorPickerProps {
    value: RGBColor;
    onChange: (color: RGBColor) => void;
    onCommit?: () => void;
}

const PRESETS = [
    'transparent',
    '#ffffff',
    '#f2f2f2',
    '#e5e7eb',
    '#9ca3af',
    '#4b5563',
    '#111827',
    '#000000',
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#22c55e',
    '#14b8a6',
    '#0ea5e9',
    '#2563eb',
    '#6366f1',
    '#a855f7',
    '#ec4899',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
    value,
    onChange,
    onCommit,
}) => (
    <Root onOpenChange={(open) => !open && onCommit?.()}>
        <Trigger asChild>
            <button
                className="size-6.5 cursor-pointer overflow-hidden rounded border border-gray-300 p-0.5"
                aria-label="Pick colour"
                type="button"
            >
                <div
                    style={{
                        backgroundColor: `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a ?? 1})`,
                    }}
                    className="flex size-full items-center justify-center overflow-hidden rounded"
                >
                    {value.a === 0 ? (
                        <Slash className="text-red-300" size={16} />
                    ) : null}
                </div>
            </button>
        </Trigger>
        <Portal>
            <Content
                className="z-50"
                alignOffset={10}
                side="bottom"
                sideOffset={5}
                align="end"
            >
                <SketchPicker
                    onChange={(color) => {
                        onChange({
                            r: color.rgb.r,
                            g: color.rgb.g,
                            b: color.rgb.b,
                            a: color.rgb.a ?? 1,
                        });
                    }}
                    presetColors={PRESETS}
                    color={value}
                />
            </Content>
        </Portal>
    </Root>
);
