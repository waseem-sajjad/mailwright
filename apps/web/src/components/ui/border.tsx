import type { Border as BorderValue } from '@/types';

import { ColorPicker } from './colorpicker';
import { SelectBox } from './selectbox';
import { Updown } from './updown';
import { Field } from './field';

export interface BorderEditorProps {
    value: BorderValue;
    onChange: (border: BorderValue) => void;
    onCommit?: () => void;
    radius?: boolean;
}

export const BorderEditor: React.FC<BorderEditorProps> = ({
    value,
    onChange,
    onCommit,
    radius = true,
}) => (
    <>
        <Field label="Border Style">
            <SelectBox
                onChange={(style) =>
                    onChange({ ...value, style: style as BorderValue['style'] })
                }
                options={[
                    { label: 'None', value: 'none' },
                    { label: 'Solid', value: 'solid' },
                    { label: 'Dashed', value: 'dashed' },
                    { label: 'Dotted', value: 'dotted' },
                ]}
                value={value.style}
            />
        </Field>
        {value.style !== 'none' ? (
            <>
                <Field label="Border Width">
                    <Updown
                        onChange={(width) => onChange({ ...value, width })}
                        value={value.width}
                        max={20}
                        min={0}
                    />
                </Field>
                <Field label="Border Color">
                    <ColorPicker
                        onChange={(color) => onChange({ ...value, color })}
                        onCommit={onCommit}
                        value={value.color}
                    />
                </Field>
            </>
        ) : null}
        {radius ? (
            <Field label="Corner Radius">
                <Updown
                    onChange={(r) => onChange({ ...value, radius: r })}
                    value={value.radius}
                    max={100}
                    min={0}
                />
            </Field>
        ) : null}
    </>
);
