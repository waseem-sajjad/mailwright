import { Content, Portal, Root, Trigger } from '@radix-ui/react-popover';
import { createContext, useContext, useMemo, useState } from 'react';

import { cn } from '@/utils';

const MenuContext = createContext<{
    close: () => void;
    preserveFocus: boolean;
}>({ close: () => {}, preserveFocus: false });

interface MenuItemProps {
    icon?: React.ReactNode;
    shortcut?: string;
    danger?: boolean;
    disabled?: boolean;
    onSelect: () => void;
    children: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    shortcut,
    danger = false,
    disabled = false,
    onSelect,
    children,
}) => {
    const { close, preserveFocus } = useContext(MenuContext);

    return (
        <button
            onMouseDown={preserveFocus ? (e) => e.preventDefault() : undefined}
            className={cn(
                'flex w-full cursor-pointer items-center gap-2.5 rounded px-2.5 py-1.5 text-left text-xs text-gray-700 outline-none hover:bg-gray-100 focus-visible:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40',
                { 'text-red-600 hover:bg-red-50': danger },
            )}
            onClick={() => {
                close();
                onSelect();
            }}
            disabled={disabled}
            role="menuitem"
            type="button"
        >
            <span
                className={cn('flex w-4 justify-center text-gray-400', {
                    'text-red-500': danger,
                })}
            >
                {icon}
            </span>
            <span className="flex-1">{children}</span>
            {shortcut ? (
                <kbd className="rounded border border-gray-200 bg-gray-50 px-1 font-sans text-[10px] text-gray-400">
                    {shortcut}
                </kbd>
            ) : null}
        </button>
    );
};

const MenuSeparator: React.FC = () => (
    <div className="my-1 h-px bg-gray-200" role="separator" />
);

const MenuLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
        {children}
    </div>
);

interface MenuProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    align?: 'start' | 'end';
    className?: string;
    /**
     * Keep focus (and the text selection) in whatever was focused before the
     * menu opened, e.g. a contentEditable block. Items apply preventDefault on
     * mousedown so selecting one does not blur the source.
     */
    preserveFocus?: boolean;
}

/** Small dropdown menu built on the popover primitive. */
export const Menu: React.FC<MenuProps> & {
    Item: typeof MenuItem;
    Separator: typeof MenuSeparator;
    Label: typeof MenuLabel;
} = ({
    trigger,
    children,
    align = 'end',
    className,
    preserveFocus = false,
}) => {
    const [open, setOpen] = useState(false);
    const context = useMemo(
        () => ({ close: () => setOpen(false), preserveFocus }),
        [preserveFocus],
    );

    return (
        <Root onOpenChange={setOpen} open={open}>
            <Trigger
                onMouseDown={
                    preserveFocus ? (e) => e.preventDefault() : undefined
                }
                asChild
            >
                {trigger}
            </Trigger>
            <Portal>
                <Content
                    className={cn(
                        'z-50 min-w-52 rounded-md border border-gray-200 bg-white p-1 shadow-lg outline-none',
                        className,
                    )}
                    onOpenAutoFocus={
                        preserveFocus ? (e) => e.preventDefault() : undefined
                    }
                    onCloseAutoFocus={
                        preserveFocus ? (e) => e.preventDefault() : undefined
                    }
                    sideOffset={6}
                    align={align}
                >
                    <MenuContext value={context}>
                        <div role="menu">{children}</div>
                    </MenuContext>
                </Content>
            </Portal>
        </Root>
    );
};

Menu.Item = MenuItem;
Menu.Separator = MenuSeparator;
Menu.Label = MenuLabel;
