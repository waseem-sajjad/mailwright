import { useEffect, useRef } from 'react';

import { useEmail } from '@/hooks';
import { cn } from '@/utils';

interface EditableProps {
    id: string;
    html: string;
    tag?: keyof React.JSX.IntrinsicElements;
    style?: React.CSSProperties;
    className?: string;
}

/**
 * Inline rich-text editor. The DOM is the source of truth while the element
 * has focus, so React never resets the caret mid-typing.
 */
export const Editable: React.FC<EditableProps> = ({
    id,
    html,
    tag = 'div',
    style,
    className,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const { updateProperties, commit, setActive } = useEmail();

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (document.activeElement === el) return;
        if (el.innerHTML !== html) el.innerHTML = html;
    }, [html]);

    const Tag = tag as 'div';

    return (
        <Tag
            className={cn('outline-none focus:outline-none', className)}
            onInput={(e) =>
                updateProperties(
                    id,
                    { text: (e.currentTarget as HTMLElement).innerHTML },
                    { transient: true },
                )
            }
            onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
            }}
            onFocus={() => setActive(id)}
            onBlur={() => commit()}
            suppressContentEditableWarning
            contentEditable
            style={style}
            ref={ref}
            role="textbox"
            aria-multiline="true"
            aria-label="Editable text"
            tabIndex={0}
        />
    );
};
