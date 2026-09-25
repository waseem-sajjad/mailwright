import type { CanvasProperties, HeadingNode } from '@/types';

import { typographyStyle } from './typography';
import { Editable } from './editable';

export const Heading: React.FC<{
    node: HeadingNode;
    canvas: CanvasProperties;
}> = ({ node, canvas }) => (
    <Editable
        style={typographyStyle(node.properties, canvas)}
        html={node.properties.text}
        tag={node.properties.level}
        id={node.id}
    />
);
