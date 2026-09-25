import { Content, Item, Root, Trigger } from '@radix-ui/react-accordion';

import { cn } from '@/utils';

const CollapsibleItem: React.FC<React.ComponentProps<typeof Item>> = ({
    className,
    children,
    value,
    ...props
}) => (
    <Item className={cn('w-full', className)} value={value} {...props}>
        {children}
    </Item>
);

const CollapsibleTrigger: React.FC<React.ComponentProps<typeof Trigger>> = ({
    className,
    children,
    ...props
}) => (
    <Trigger
        className={cn(
            'group w-full cursor-pointer bg-hover p-2 text-left text-xs font-medium text-gray-700',
            className,
        )}
        {...props}
    >
        {children}
    </Trigger>
);

const CollapsibleContent: React.FC<React.ComponentProps<typeof Content>> = ({
    className,
    children,
    ...props
}) => (
    <Content
        className={cn(
            'overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown',
            className,
        )}
        {...props}
    >
        {children}
    </Content>
);

type CollapsibleComponent = React.FC<React.ComponentProps<typeof Root>> & {
    Item: typeof CollapsibleItem;
    Trigger: typeof CollapsibleTrigger;
    Content: typeof CollapsibleContent;
};

export const Collapsible: CollapsibleComponent = ({ children, ...props }) => (
    <Root {...props}>{children}</Root>
);

Collapsible.Item = CollapsibleItem;
Collapsible.Trigger = CollapsibleTrigger;
Collapsible.Content = CollapsibleContent;
