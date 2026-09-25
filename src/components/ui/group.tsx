import { createContext, useContext, useMemo } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/utils';

interface GroupContextProps {
    onChange: (value: string) => void;
    value: string;
}

const GroupContext = createContext<GroupContextProps | undefined>(undefined);

const useGroup = () => {
    const context = useContext(GroupContext);
    if (!context) {
        throw new Error('useGroup must be used within a Group');
    }

    return context;
};

export interface GroupItemProps {
    children: React.ReactNode;
    value: string;
}

export const GroupItem: React.FC<GroupItemProps> = ({ children, value }) => {
    const state = useGroup();

    return (
        <Slot
            aria-label={value}
            aria-pressed={state.value === value}
            className={cn(
                'cursor-pointer border-l border-gray-300 px-3 py-2 text-gray-600 transition-colors duration-200 ease-in-out first:border-l-0 hover:bg-gray-100',
                {
                    'bg-gray-100 text-blue-600': state.value === value,
                },
            )}
            onClick={() => state.onChange(value)}
        >
            {children}
        </Slot>
    );
};

export interface GroupRootProps {
    onChange: (value: string) => void;
    children: React.ReactNode;
    value: string;
}

export const GroupRoot: React.FC<GroupRootProps> = ({
    children,
    value,
    onChange,
}) => {
    const store = useMemo(() => ({ onChange, value }), [value, onChange]);

    return (
        <GroupContext value={store}>
            <div className="flex w-fit overflow-hidden rounded-xs border border-gray-300">
                {children}
            </div>
        </GroupContext>
    );
};
