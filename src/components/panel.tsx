import { ChevronDown } from 'lucide-react';

import { Collapsible } from '@/components/ui';
import { useEmail } from '@/hooks';
import { cn } from '@/utils';

import { properties } from './properties';
import { components } from './components';
import { Card } from './card';

interface HeaderProps
    extends Omit<React.ComponentPropsWithRef<'div'>, 'children'> {
    headerType: 'components' | 'properties';
}

const Header: React.FC<HeaderProps> = ({ className, headerType, ...props }) => {
    const { active } = useEmail();
    let component = 'General Settings';

    if (active !== undefined) {
        component = properties[active.name].name;
    }

    return (
        <div
            className={cn('flex h-full items-center bg-hover px-2', className)}
            {...props}
        >
            <h4 className="text-sm font-medium text-gray-700">
                {headerType === 'components' ? 'Component Panel' : component}
            </h4>
        </div>
    );
};

const Components: React.FC<React.ComponentPropsWithRef<'div'>> = () => (
    <div className="flex flex-col gap-2">
        <Collapsible defaultValue={['layout', 'components']} type="multiple">
            <Collapsible.Item value="layout">
                <Collapsible.Trigger className="flex items-center justify-between border-b border-gray-300">
                    Layout
                    <ChevronDown
                        className="transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                        aria-hidden
                        size={16}
                    />
                </Collapsible.Trigger>
                <Collapsible.Content className="border-b border-gray-300">
                    <div className="grid grid-cols-3 gap-2 p-2">
                        {components
                            .filter((c) => c.component === 'layout')
                            .map((component) => (
                                <Card
                                    component={component.component}
                                    icon={component.icon}
                                    name={component.name}
                                    key={component.name}
                                />
                            ))}
                    </div>
                </Collapsible.Content>
            </Collapsible.Item>
            <Collapsible.Item value="components">
                <Collapsible.Trigger className="flex items-center justify-between border-b border-gray-300">
                    Components
                    <ChevronDown
                        className="transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                        aria-hidden
                        size={16}
                    />
                </Collapsible.Trigger>
                <Collapsible.Content>
                    <div className="grid grid-cols-3 gap-2 p-2">
                        {components
                            .filter((c) => c.component !== 'layout')
                            .map((component) => (
                                <Card
                                    icon={component.icon}
                                    name={component.name}
                                    key={component.name}
                                />
                            ))}
                    </div>
                </Collapsible.Content>
            </Collapsible.Item>
        </Collapsible>
    </div>
);

const Properties: React.FC<React.ComponentPropsWithRef<'div'>> = () => {
    const { components: email, active } = useEmail();
    let Component = properties[email[0].name].element;
    let props = email[0];
    if (active !== undefined) {
        Component = properties[active.name].element;
        props = active;
    }
    return (
        <div className="p-2">
            <Component {...props} />
        </div>
    );
};

interface PanelComponent
    extends React.FC<
        React.ComponentPropsWithRef<'div'> & { padding?: string }
    > {
    Properties: typeof Properties;
    Components: typeof Components;
    Header: typeof Header;
}

export const Panel: PanelComponent = ({
    children,
    padding,
    style,
    ...props
}) => (
    <div
        style={{
            padding,
            ...style,
        }}
        {...props}
    >
        {children}
    </div>
);

Panel.Components = Components;
Panel.Properties = Properties;
Panel.Header = Header;
