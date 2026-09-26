import { Canvas, Content, Root, Sidebar } from '@/layout';
import { Dialogs } from '@/components/dialogs';
import { Toast } from '@/components/toast';
import { AdSlot } from '@/components/ads';
import { Panel } from '@/components/panel';
import { useSettings, useShortcuts } from '@/hooks';

const Editor = () => {
    useShortcuts();
    const sidebarTab = useSettings((s) => s.sidebarTab);

    return (
        <Root>
            <Sidebar
                className="shrink-0 transition-[width] duration-200"
                width={sidebarTab === 'ai' ? '24rem' : '18rem'}
            >
                <Sidebar.Header>
                    <Panel.Header headerType="components" />
                </Sidebar.Header>
                <Sidebar.Content fill={sidebarTab === 'ai'}>
                    <Panel.Components />
                </Sidebar.Content>
                <AdSlot
                    className="border-t border-gray-200 bg-white p-2"
                    slot={import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR}
                />
            </Sidebar>
            <Content>
                <Canvas />
            </Content>
            <Sidebar className="shrink-0" width="22rem">
                <Sidebar.Header>
                    <Panel.Header headerType="properties" />
                </Sidebar.Header>
                <Sidebar.Content>
                    <Panel.Properties />
                </Sidebar.Content>
            </Sidebar>
            <Dialogs />
            <Toast />
        </Root>
    );
};

export default Editor;
