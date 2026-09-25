import type { CanvasProperties, TextNode } from '@/types';

import { typographyStyle } from './typography';
import { Editable } from './editable';

export const Text: React.FC<{ node: TextNode; canvas: CanvasProperties }> = ({
    node,
    canvas,
}) => (
    <Editable
        style={typographyStyle(node.properties, canvas)}
        html={node.properties.text}
        id={node.id}
    />
);
