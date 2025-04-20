import { ColorPicker, Input, SelectBox, Updown } from '@/components/ui';
import type { BaseComponent, CanvasProperties } from '@/types';

export const CanvasProperty: React.FC<BaseComponent<CanvasProperties>> = ({
    updateProperties,
    properties,
}) => (
    <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between px-4 pt-5">
            <span className="text-xs font-medium text-gray-600">
                Background Color
            </span>
            <ColorPicker
                defaultColor={properties.backgroundColor}
                onChange={(val) => {
                    updateProperties({
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
            <ColorPicker />
        </div>
        <hr className="mx-4 border-gray-200" />
        <div className="flex items-center justify-between px-4">
            <span className="text-xs font-medium text-gray-600">
                Font Family
            </span>
            <SelectBox
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
            <Updown max={900} />
        </div>
        <hr className="mx-4 border-gray-200" />
        <div className="flex flex-col gap-2 px-4">
            <span className="text-xs font-medium text-gray-600">
                Preheader Text
            </span>
            <Input placeholder="Please enter email preheader." />
        </div>
    </div>
);
