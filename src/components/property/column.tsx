import type { ColumnComponentType, ColumnProperties } from '@/types';
import { ColorPicker } from '@/components/ui';
import { useEmail } from '@/hooks';

export const ColumnProperty: React.FC<ColumnComponentType> = ({
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
                    onChange={(c) => {
                        updateActiveProperties<ColumnProperties>({
                            backgroundColor: c,
                        });
                    }}
                />
            </div>
        </div>
    );
};
