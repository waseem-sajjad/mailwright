import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';

import type { Align } from '@/types';

import { GroupItem, GroupRoot } from './group';

export interface AlignGroupProps {
    value: Align;
    onChange: (value: Align) => void;
}

export const AlignGroup: React.FC<AlignGroupProps> = ({ value, onChange }) => (
    <GroupRoot onChange={(val) => onChange(val as Align)} value={value}>
        <GroupItem value="left">
            <button title="Align left" aria-label="Align left" type="button">
                <AlignLeft size={16} />
            </button>
        </GroupItem>
        <GroupItem value="center">
            <button
                title="Align center"
                aria-label="Align center"
                type="button"
            >
                <AlignCenter size={16} />
            </button>
        </GroupItem>
        <GroupItem value="right">
            <button title="Align right" aria-label="Align right" type="button">
                <AlignRight size={16} />
            </button>
        </GroupItem>
    </GroupRoot>
);
