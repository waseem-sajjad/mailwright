import { ColorPicker, Input, SelectBox, Updown } from '@/components/ui';
import type { CanvasComponentType } from '@/types';
import { useEmail } from '@/hooks';

export const CanvasProperty: React.FC<CanvasComponentType> = ({
    properties,
}) => {
    const { updateActiveProperties } = useEmail();

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between px-4 pt-5">
                <span className="text-xs font-medium text-gray-600">
                    Background Color
                </span>
                <ColorPicker
                    defaultColor={properties.backgroundColor}
                    onChange={(val) => {
                        updateActiveProperties({
                            backgroundColor: val,
                        });
                    }}
                />
            </div>
            <hr className="mx-4 border-gray-200" />
            <div className="flex items-center justify-between px-4">
                <span className="text-xs font-medium text-gray-600">
                    Text Color
                </span>
                <ColorPicker
                    defaultColor={properties.color}
                    onChange={(val) => {
                        updateActiveProperties({
                            color: val,
                        });
                    }}
                />
            </div>
            <hr className="mx-4 border-gray-200" />
            <div className="flex items-center justify-between px-4">
                <span className="text-xs font-medium text-gray-600">
                    Font Family
                </span>
                <SelectBox
                    defaultValue={properties.fontFamily}
                    onChange={(value) => {
                        updateActiveProperties({
                            fontFamily: value,
                        });
                    }}
                    options={[
                        {
                            label: 'Arial',
                            value: 'Arial',
                        },
                        {
                            label: 'Helvetica Neue',
                            value: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        },
                        {
                            label: 'Times New Roman',
                            value: 'Times New Roman',
                        },
                        {
                            label: 'Courier New',
                            value: 'Courier New',
                        },
                        {
                            label: 'Verdana',
                            value: 'Verdana',
                        },
                        {
                            label: 'Georgia',
                            value: 'Georgia',
                        },
                        {
                            label: 'Tahoma',
                            value: 'Tahoma',
                        },
                        {
                            label: 'Trebuchet MS',
                            value: "'Trebuchet MS', Helvetica, sans-serif",
                        },
                    ]}
                />
            </div>
            <hr className="mx-4 border-gray-200" />
            <div className="flex items-center justify-between px-4">
                <span className="text-xs font-medium text-gray-600">
                    Font Weight
                </span>
                <SelectBox
                    defaultValue={properties.fontWeight}
                    onChange={(value) => {
                        updateActiveProperties({
                            fontWeight: value,
                        });
                    }}
                    options={[
                        {
                            label: 'Normal',
                            value: 'normal',
                        },
                        {
                            label: 'Bold',
                            value: 'bold',
                        },
                    ]}
                />
            </div>
            <hr className="mx-4 border-gray-200" />
            <div className="flex items-center justify-between px-4">
                <span className="text-xs font-medium text-gray-600">
                    Content Width
                </span>
                <Updown
                    defaultValue={properties.contentWidth}
                    max={900}
                    onChange={(value) => {
                        updateActiveProperties({
                            contentWidth: value,
                        });
                    }}
                />
            </div>
            <hr className="mx-4 border-gray-200" />
            <div className="flex flex-col gap-2 px-4">
                <span className="text-xs font-medium text-gray-600">
                    Preheader Text
                </span>
                <Input
                    defaultValue={properties.preheaderText}
                    placeholder="Please enter email preheader."
                    onChange={(e) => {
                        updateActiveProperties({
                            preheaderText: e.target.value,
                        });
                    }}
                />
            </div>
        </div>
    );
};
