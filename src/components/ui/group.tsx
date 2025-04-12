import { createContext, useContext, useMemo, useState } from 'react';
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
            className={cn(
                'cursor-pointer border-l border-gray-300 px-3 py-2 transition-colors duration-200 ease-in-out hover:bg-gray-100',
                {
                    'bg-gray-100': state.value === value,
                },
            )}
            onClick={() => state.onChange(value)}
        >
            {children}
        </Slot>
    );
};

const Group: React.FC<React.PropsWithChildren> = ({ children }) => (
    <div className="w-fit overflow-hidden rounded-xs border-y border-gray-300 last:border-r">
        {children}
    </div>
);

export interface GroupRootProps {
    onChange?: (value: string) => void;
    children: React.ReactNode;
    defaultValue: string;
}

export const GroupRoot: React.FC<GroupRootProps> = ({
    children,
    defaultValue,
    onChange,
}) => {
    const [value, setValue] = useState(defaultValue);

    const store = useMemo(() => {
        const handleOnChange = (val: string) => {
            setValue(val);
            onChange?.(val);
        };

        return {
            onChange: handleOnChange,
            value,
        };
    }, [value, onChange]);

    useMemo(() => {
        if (defaultValue !== value) {
            setValue(defaultValue);
        }
    }, [defaultValue, value]);

    return (
        <GroupContext value={store}>
            <Group>{children}</Group>
        </GroupContext>
    );
};
