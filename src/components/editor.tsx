import { Canvas, Content, Root, Sidebar } from '@/layout';
import { Dialogs } from '@/components/dialogs';
import { Panel } from '@/components/panel';
import { useShortcuts } from '@/hooks';

const Editor = () => {
    useShortcuts();

    return (
        <Root>
            <Sidebar className="shrink-0" width="18rem">
                <Sidebar.Header>
                    <Panel.Header headerType="components" />
                </Sidebar.Header>
                <Sidebar.Content>
                    <Panel.Components />
                </Sidebar.Content>
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
        </Root>
    );
};

export default Editor;
