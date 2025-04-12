import { Canvas, Content, Root, Sidebar } from '@/layout';
import { Panel } from '@/components/panel';

const Editor = () => (
    <Root>
        <Sidebar width="35rem">
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
        <Sidebar width="45rem">
            <Sidebar.Header>
                <Panel.Header headerType="properties" />
            </Sidebar.Header>
            <Sidebar.Content>
                <Panel.Properties />
            </Sidebar.Content>
        </Sidebar>
    </Root>
);

export default Editor;
