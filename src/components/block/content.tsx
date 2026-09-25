import type { CanvasProperties, EmailNode } from '@/types';
import { Container } from '@/components/container';
import { blockMeta } from '@/components/blocks';

import { Divider } from './divider';
import { Heading } from './heading';
import { Button } from './button';
import { Social } from './social';
import { Spacer } from './spacer';
import { Image } from './image';
import { Video } from './video';
import { Html } from './html';
import { List } from './list';
import { Menu } from './menu';
import { Text } from './text';

interface ContentProps {
    node: EmailNode;
    canvas: CanvasProperties;
}

const render = (node: EmailNode, canvas: CanvasProperties) => {
    switch (node.type) {
        case 'Heading':
            return <Heading canvas={canvas} node={node} />;
        case 'Text':
            return <Text canvas={canvas} node={node} />;
        case 'Divider':
            return <Divider node={node} />;
        case 'Button':
            return <Button canvas={canvas} node={node} />;
        case 'List':
            return <List canvas={canvas} node={node} />;
        case 'Image':
            return <Image contentWidth={canvas.contentWidth} node={node} />;
        case 'Video':
            return <Video contentWidth={canvas.contentWidth} node={node} />;
        case 'Social':
            return <Social node={node} />;
        case 'HTML':
            return <Html node={node} />;
        case 'Menu':
            return <Menu canvas={canvas} node={node} />;
        case 'Spacer':
            return <Spacer node={node} />;
        default:
            return null;
    }
};

/** Renders any content block wrapped in its selectable container. */
export const Content: React.FC<ContentProps> = ({ node, canvas }) => (
    <Container name={blockMeta[node.type].label} kind="content" id={node.id}>
        {render(node, canvas)}
    </Container>
);
