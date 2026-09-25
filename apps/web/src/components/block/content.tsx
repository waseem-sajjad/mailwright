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
import { Table } from './table';
import { Icons } from './icons';
import { Product } from './product';
import { Quote } from './quote';
import { Coupon } from './coupon';
import { Callout } from './callout';
import { Footer } from './footer';

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
        case 'Table':
            return <Table canvas={canvas} node={node} />;
        case 'Icons':
            return <Icons canvas={canvas} node={node} />;
        case 'Product':
            return <Product canvas={canvas} node={node} />;
        case 'Quote':
            return <Quote canvas={canvas} node={node} />;
        case 'Coupon':
            return <Coupon canvas={canvas} node={node} />;
        case 'Callout':
            return <Callout canvas={canvas} node={node} />;
        case 'Footer':
            return <Footer canvas={canvas} node={node} />;
        default:
            return null;
    }
};

/** Renders any content block wrapped in its selectable container. */
export const Content: React.FC<ContentProps> = ({ node, canvas }) => (
    <Container
        visibility={{
            hideOnMobile: node.properties.hideOnMobile,
            hideOnDesktop: node.properties.hideOnDesktop,
        }}
        name={blockMeta[node.type].label}
        kind="content"
        id={node.id}
    >
        {render(node, canvas)}
    </Container>
);
