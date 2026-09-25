import { Monitor, Smartphone } from 'lucide-react';

import type { EmailNode, Visibility } from '@/types';
import { CheckBox, Field } from '@/components/ui';
import { useNodeProps } from '@/hooks';

/** Per-device visibility toggles shared by rows and content blocks. */
export const VisibilityFields: React.FC<{ node: EmailNode<Visibility> }> = ({
    node,
}) => {
    const { p, set } = useNodeProps(node);

    return (
        <div className="flex flex-col gap-4 border-t border-gray-200 pt-5">
            <h5 className="px-4 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                Visibility
            </h5>
            <Field
                label="Hide on mobile"
                hint="Uses a media query; Outlook desktop ignores it"
            >
                <div className="flex items-center gap-2">
                    <Smartphone className="text-gray-400" size={14} />
                    <CheckBox
                        onChange={(hideOnMobile) => set({ hideOnMobile })}
                        checked={p.hideOnMobile === true}
                    />
                </div>
            </Field>
            <Field label="Hide on desktop">
                <div className="flex items-center gap-2">
                    <Monitor className="text-gray-400" size={14} />
                    <CheckBox
                        onChange={(hideOnDesktop) => set({ hideOnDesktop })}
                        checked={p.hideOnDesktop === true}
                    />
                </div>
            </Field>
        </div>
    );
};
