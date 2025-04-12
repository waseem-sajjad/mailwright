import { ColorPicker, Input, SelectBox, Updown } from '@/components/ui';
import { useCanvas } from '@/hooks';

export const CanvasProperty = () => {
    const { setStyles, styles } = useCanvas();

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between px-4 pt-5">
                <span className="text-xs font-medium text-gray-600">
                    Background Color
                </span>
                <ColorPicker
                    onChange={(color) => {
                        styles.backgroundColor = color;
                        setStyles(styles);
                    }}
                    defaultColor={styles.backgroundColor}
                />
            </div>
            <hr className="mx-4 border-gray-200" />
            <div className="flex items-center justify-between px-4">
                <span className="text-xs font-medium text-gray-600">
                    Text Color
                </span>
                <ColorPicker
                    onChange={(color) => {
                        styles.color = color;
                        setStyles(styles);
                    }}
                    defaultColor={styles.color}
                />
            </div>
            <hr className="mx-4 border-gray-200" />
            <div className="flex items-center justify-between px-4">
                <span className="text-xs font-medium text-gray-600">
                    Font Family
                </span>
                <SelectBox
                    defaultValue={styles.fontFamily}
                    onChange={(value) => {
                        styles.fontFamily = value;
                        setStyles(styles);
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
                    defaultValue={styles.fontWeight}
                    onChange={(value) => {
                        styles.fontWeight = value;
                        setStyles(styles);
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
                    defaultValue={styles.contentWidth}
                    onChange={(val) => {
                        styles.contentWidth = val;
                        setStyles(styles);
                    }}
                    max={900}
                />
            </div>
            <hr className="mx-4 border-gray-200" />
            <div className="flex flex-col gap-2 px-4">
                <span className="text-xs font-medium text-gray-600">
                    Preheader Text
                </span>
                <Input
                    placeholder="Please enter email preheader."
                    onChange={(e) => {
                        styles.preheaderText = e.target.value;
                        setStyles(styles);
                    }}
                    value={styles.preheaderText}
                />
            </div>
        </div>
    );
};
