import { Content, Portal, Root, Trigger } from '@radix-ui/react-popover';
import type { ColorResult, RGBColor } from 'react-color';
import { SketchPicker } from 'react-color';
import { useMemo, useState } from 'react';
import { Slash } from 'lucide-react';

export interface ColorPickerProps {
    defaultColor?: RGBColor;
    onChange?: (color: RGBColor) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
    defaultColor,
    onChange,
}) => {
    const [value, setValue] = useState<ColorResult>({
        hex: '#000000',
        hsl: { h: 0, s: 0, l: 0 },
        rgb: defaultColor ?? { r: 0, g: 0, b: 0 },
    });

    useMemo(() => {
        if (defaultColor) {
            setValue({
                hex: '#000000',
                hsl: { h: 0, s: 0, l: 0 },
                rgb: defaultColor,
            });
        }
    }, [defaultColor]);

    return (
        <Root>
            <Trigger asChild>
                <div className="size-6.5 cursor-pointer overflow-hidden rounded border border-gray-300 p-0.5">
                    <div
                        style={{
                            backgroundColor: `rgba(${value.rgb.r}, ${value.rgb.g}, ${value.rgb.b}, ${value.rgb.a ?? 1})`,
                        }}
                        className="flex size-full items-center justify-center overflow-hidden rounded"
                    >
                        {value.rgb?.a === 0 ? (
                            <div>
                                <Slash className="text-red-300" size={16} />
                            </div>
                        ) : null}
                    </div>
                </div>
            </Trigger>
            <Portal>
                <Content
                    alignOffset={10}
                    side="bottom"
                    sideOffset={5}
                    align="end"
                >
                    <SketchPicker
                        onChange={(color) => {
                            setValue(color);
                            onChange?.({
                                r: color.rgb.r,
                                g: color.rgb.g,
                                b: color.rgb.b,
                                a: color.rgb.a,
                            });
                        }}
                        presetColors={[
                            'transparent',
                            '#f2f2f2',
                            '#000000',
                            '#333333',
                            '#666666',
                            '#999999',
                            '#cccccc',
                            '#ffffff',
                            '#ff0000',
                            '#ff9900',
                            '#ffff00',
                            '#00ff00',
                            '#00ffff',
                            '#0000ff',
                            '#9900ff',
                            '#ff00ff',
                            '#ffcc00',
                            '#ff6600',
                            '#cc3300',
                            '#993300',
                            '#003300',
                            '#003366',
                            '#000080',
                            '#333399',
                        ]}
                        color={value?.rgb}
                    />
                </Content>
            </Portal>
        </Root>
    );
};
