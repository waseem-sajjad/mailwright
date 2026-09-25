import type { ButtonNode, CanvasProperties } from '@/types';
import { borderCss, paddingCss, rgbaToCss } from '@/utils';

export const Button: React.FC<{
    node: ButtonNode;
    canvas: CanvasProperties;
}> = ({ node, canvas }) => {
    const p = node.properties;
    return (
        <div
            style={{
                padding: paddingCss(p.padding),
                textAlign: p.align,
            }}
        >
            <span
                style={{
                    display: p.fullWidth ? 'block' : 'inline-block',
                    backgroundColor: rgbaToCss(p.backgroundColor),
                    color: rgbaToCss(p.color),
                    padding: paddingCss(p.innerPadding),
                    borderRadius: p.border.radius,
                    border: borderCss(p.border),
                    fontFamily: canvas.fontFamily,
                    fontSize: p.fontSize,
                    fontWeight: p.fontWeight,
                    lineHeight: 1.2,
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    cursor: 'default',
                }}
            >
                {p.text || 'Button'}
            </span>
        </div>
    );
};
