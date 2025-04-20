import { AlignCenter, AlignLeft } from 'lucide-react';

import {
    CheckBox,
    ColorPicker,
    GroupItem,
    GroupRoot,
    Padding,
} from '@/components/ui';
import type { RowComponentType, RowProperties } from '@/types';
import { useEmail } from '@/hooks';

export const RowProperty: React.FC<RowComponentType> = ({ properties }) => {
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
                        updateActiveProperties<RowProperties>({
                            backgroundColor: c,
                        });
                    }}
                />
            </div>
            <hr className="mx-4 border-gray-300" />
            <div className="flex items-center justify-between px-4">
                <span className="text-xs font-medium text-gray-600">
                    Content Alignment
                </span>
                <GroupRoot
                    onChange={(val) => {
                        updateActiveProperties<RowProperties>({
                            contentAlign: val,
                        });
                    }}
                    defaultValue={properties.contentAlign}
                >
                    <GroupItem value="left">
                        <button title="Align Left" type="button">
                            <AlignLeft size={16} />
                        </button>
                    </GroupItem>
                    <GroupItem value="center">
                        <button title="Align Center" type="button">
                            <AlignCenter size={16} />
                        </button>
                    </GroupItem>
                    {/* <GroupItem value="right">
                <button title="Align Right" type="button">
                    <AlignRight size={16} />
                </button>
            </GroupItem> */}
                </GroupRoot>
            </div>
            <hr className="mx-4 border-gray-300" />
            <Padding
                defaultValue={{
                    bottom: properties.paddingBottom,
                    right: properties.paddingRight,
                    left: properties.paddingLeft,
                    top: properties.paddingTop,
                }}
                onChange={(val) => {
                    updateActiveProperties<RowProperties>({
                        paddingTop: val.top,
                        paddingRight: val.right,
                        paddingBottom: val.bottom,
                        paddingLeft: val.left,
                    });
                }}
                link={properties.paddingLink}
                onLinkChange={(val) => {
                    updateActiveProperties<RowProperties>({
                        paddingLink: val,
                    });
                }}
            />
            <hr className="mx-4 border-gray-300" />
            <div className="flex items-center justify-between px-4">
                <span className="text-xs font-medium text-gray-600">
                    Content Stack If Mobile
                </span>
                <CheckBox
                    defaultChecked={properties.stack}
                    onChange={(val) => {
                        updateActiveProperties<RowProperties>({
                            stack: val.target.checked,
                        });
                    }}
                />
            </div>
        </div>
    );
};
