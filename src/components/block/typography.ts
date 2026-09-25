import type { CanvasProperties, TextLikeProperties } from '@/types';
import { rgbaToCss } from '@/utils';

/** Shared CSS for Heading and Text blocks in the editor preview. */
export const typographyStyle = (
    p: TextLikeProperties,
    canvas: CanvasProperties,
): React.CSSProperties => ({
    margin: 0,
    fontFamily: p.fontFamily === 'inherit' ? canvas.fontFamily : p.fontFamily,
    fontSize: p.fontSize,
    lineHeight: p.lineHeight,
    letterSpacing: p.letterSpacing,
    fontWeight: p.fontWeight,
    color: p.inheritColor ? rgbaToCss(canvas.color) : rgbaToCss(p.color),
    textAlign: p.align,
    padding: `${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px`,
    wordBreak: 'break-word',
});
