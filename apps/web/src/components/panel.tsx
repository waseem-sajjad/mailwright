import {
    ChevronDown,
    ChevronRight,
    Layers,
    LayoutGrid,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import type { EmailNode } from '@/types';
import { VisibilityFields } from '@/components/property/visibility';
import { propertyPanels } from '@/components/property';
import { blockMeta, blockTypes } from '@/components/blocks';
import { useActiveNode, useEmail, useSettings } from '@/hooks';
import { Collapsible } from '@/components/ui';
import { ChatPanel } from '@/components/chat';
import { Card } from '@/components/card';
import { cn, findPath } from '@/utils';

interface HeaderProps
    extends Omit<React.ComponentPropsWithRef<'div'>, 'children'> {
    headerType: 'components' | 'properties';
}

const Header: React.FC<HeaderProps> = ({ className, headerType, ...props }) => {
    const active = useActiveNode();
    const { sidebarTab, setSidebarTab } = useSettings();

    if (headerType === 'components') {
        return (
            <div
                className={cn('flex h-full items-stretch', className)}
                {...props}
            >
                {(
                    [
                        ['blocks', 'Blocks', <LayoutGrid size={14} key="b" />],
                        ['layers', 'Layers', <Layers size={14} key="l" />],
                        ['ai', 'AI', <Sparkles size={14} key="a" />],
                    ] as const
                ).map(([tab, label, icon]) => (
                    <button
                        className={cn(
                            'flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-b-2 text-xs font-medium text-gray-500 transition-colors hover:text-gray-800',
                            sidebarTab === tab
                                ? 'border-blue-500 text-gray-800'
                                : 'border-transparent',
                            tab === 'ai' && sidebarTab === tab
                                ? 'border-violet-500 text-violet-700'
                                : '',
                        )}
                        onClick={() => setSidebarTab(tab)}
                        type="button"
                        key={tab}
                    >
                        {icon}
                        {label}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn('flex h-full items-center bg-hover px-3', className)}
            {...props}
        >
            <h4 className="text-sm font-medium text-gray-700">
                {blockMeta[active.type].label} Settings
            </h4>
        </div>
    );
};

const Trigger: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Collapsible.Trigger className="flex items-center justify-between border-b border-gray-300">
        {children}
        <ChevronDown
            className="transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
            aria-hidden
            size={16}
        />
    </Collapsible.Trigger>
);

const Blocks: React.FC = () => (
    <Collapsible
        defaultValue={['layout', 'content', 'section']}
        type="multiple"
    >
        <Collapsible.Item value="layout">
            <Trigger>Layout</Trigger>
            <Collapsible.Content className="border-b border-gray-300">
                <div className="grid grid-cols-3 gap-2 p-2">
                    {blockTypes('layout').map((type) => (
                        <Card
                            icon={blockMeta[type].icon}
                            name={type}
                            key={type}
                        />
                    ))}
                </div>
                <p className="px-3 pb-3 text-[11px] text-gray-400">
                    Drop a Row on the canvas. Drop a Column onto a row to add
                    one.
                </p>
            </Collapsible.Content>
        </Collapsible.Item>
        <Collapsible.Item value="content">
            <Trigger>Content</Trigger>
            <Collapsible.Content className="border-b border-gray-300">
                <div className="grid grid-cols-3 gap-2 p-2">
                    {blockTypes('content').map((type) => (
                        <Card
                            icon={blockMeta[type].icon}
                            name={type}
                            key={type}
                        />
                    ))}
                </div>
            </Collapsible.Content>
        </Collapsible.Item>
        <Collapsible.Item value="section">
            <Trigger>Sections</Trigger>
            <Collapsible.Content>
                <div className="grid grid-cols-3 gap-2 p-2">
                    {blockTypes('section').map((type) => (
                        <Card
                            icon={blockMeta[type].icon}
                            name={type}
                            key={type}
                        />
                    ))}
                </div>
                <p className="px-3 pb-3 text-[11px] text-gray-400">
                    Ready-made pieces built from email-safe tables.
                </p>
            </Collapsible.Content>
        </Collapsible.Item>
    </Collapsible>
);

const LayerRow: React.FC<{ node: EmailNode; depth: number }> = ({
    node,
    depth,
}) => {
    const activeId = useEmail((s) => s.activeId);
    const setActive = useEmail((s) => s.setActive);
    const { setHover } = useSettings();
    const [open, setOpen] = useState(true);
    const hasChildren = node.children.length > 0;
    const meta = blockMeta[node.type];
    const preview =
        node.type === 'Heading' || node.type === 'Text'
            ? String(node.properties.text)
                  .replace(/<[^>]+>/g, '')
                  .slice(0, 28)
            : '';

    return (
        <div>
            <div
                className={cn(
                    'flex cursor-pointer items-center gap-1 py-1 pr-2 text-xs text-gray-700 hover:bg-gray-100',
                    { 'bg-blue-50 text-blue-700': activeId === node.id },
                )}
                style={{ paddingLeft: 8 + depth * 14 }}
                onMouseEnter={() => setHover(node.id)}
                onMouseLeave={() => setHover('')}
                onClick={() => setActive(node.id)}
                aria-hidden
            >
                <button
                    className={cn('p-0.5 text-gray-400', {
                        invisible: !hasChildren,
                    })}
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen((o) => !o);
                    }}
                    aria-label={open ? 'Collapse' : 'Expand'}
                    type="button"
                >
                    <ChevronRight
                        className={cn('transition-transform', {
                            'rotate-90': open,
                        })}
                        size={12}
                    />
                </button>
                <span className="text-sm text-blue-400">{meta.icon}</span>
                <span className="font-medium">{meta.label}</span>
                {preview ? (
                    <span className="truncate text-gray-400">·{preview}</span>
                ) : null}
            </div>
            {open && hasChildren
                ? node.children.map((child) => (
                      <LayerRow depth={depth + 1} node={child} key={child.id} />
                  ))
                : null}
        </div>
    );
};

const LayersPanel: React.FC = () => {
    const root = useEmail((s) => s.root);
    return (
        <div className="py-1">
            <LayerRow node={root} depth={0} />
        </div>
    );
};

const Components: React.FC = () => {
    const { sidebarTab } = useSettings();
    if (sidebarTab === 'ai') return <ChatPanel />;
    return sidebarTab === 'blocks' ? <Blocks /> : <LayersPanel />;
};

const Breadcrumb: React.FC = () => {
    const root = useEmail((s) => s.root);
    const activeId = useEmail((s) => s.activeId);
    const setActive = useEmail((s) => s.setActive);
    const path = findPath(root, activeId);
    if (path.length <= 1) return null;

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-body px-3 py-2 text-[11px] text-gray-500">
            {path.map((node, index) => (
                <span className="flex items-center gap-1" key={node.id}>
                    {index > 0 ? <ChevronRight size={10} /> : null}
                    <button
                        className={cn('cursor-pointer hover:text-blue-600', {
                            'font-medium text-gray-800':
                                index === path.length - 1,
                        })}
                        onClick={() => setActive(node.id)}
                        type="button"
                    >
                        {blockMeta[node.type].label}
                    </button>
                </span>
            ))}
        </div>
    );
};

const Properties: React.FC = () => {
    const active = useActiveNode();
    const Component = propertyPanels[active.type];

    return (
        <div>
            <Breadcrumb />
            {/* Remount the panel when the selection changes so local state resets. */}
            <Component node={active} key={active.id} />
            {active.type !== 'Canvas' && active.type !== 'Column' ? (
                <div className="pb-5">
                    <VisibilityFields node={active} key={`vis-${active.id}`} />
                </div>
            ) : null}
        </div>
    );
};

interface PanelComponent extends React.FC<React.PropsWithChildren> {
    Properties: typeof Properties;
    Components: typeof Components;
    Header: typeof Header;
}

export const Panel: PanelComponent = ({ children }) => <div>{children}</div>;

Panel.Components = Components;
Panel.Properties = Properties;
Panel.Header = Header;
