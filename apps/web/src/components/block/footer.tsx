import type { CanvasProperties, FooterNode } from '@/types';
import { paddingCss, rgbaToCss } from '@/utils';

import { TagText } from './tagtext';

export const Footer: React.FC<{
    node: FooterNode;
    canvas: CanvasProperties;
}> = ({ node, canvas }) => {
    const p = node.properties;
    const link = {
        color: rgbaToCss(p.linkColor),
        textDecoration: 'underline',
    };
    return (
        <div
            style={{
                padding: paddingCss(p.padding),
                fontFamily: canvas.fontFamily,
                fontSize: p.fontSize,
                lineHeight: 1.6,
                color: rgbaToCss(p.color),
                textAlign: p.align,
            }}
        >
            {p.company ? (
                <div style={{ fontWeight: 'bold' }}>
                    <TagText text={p.company} />
                </div>
            ) : null}
            {p.address ? (
                <div>
                    <TagText text={p.address} />
                </div>
            ) : null}
            {p.text ? (
                <div style={{ marginTop: 6 }}>
                    <TagText text={p.text} />
                </div>
            ) : null}
            <div style={{ marginTop: 6 }}>
                {p.unsubscribeText ? (
                    <span style={link}>
                        <TagText text={p.unsubscribeText} />
                    </span>
                ) : null}
                {p.unsubscribeText && p.preferencesText ? ' · ' : null}
                {p.preferencesText ? (
                    <span style={link}>
                        <TagText text={p.preferencesText} />
                    </span>
                ) : null}
            </div>
        </div>
    );
};
