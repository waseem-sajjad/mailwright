import { useEffect, useRef } from 'react';

import { useEmail } from '@/hooks';
import {
    cn,
    decorateLiveTags,
    decorateTags,
    forgetSelection,
    rememberSelection,
    undecorateTags,
} from '@/utils';

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
    const pendingFocus = useEmail((s) => s.pendingFocus);
    const clearPendingFocus = useEmail((s) => s.clearPendingFocus);
    const mergeTags = useEmail((s) => s.root.properties.mergeTags);

    useEffect(() => {
        if (pendingFocus !== id || !ref.current) return;
        const el = ref.current;
        el.focus();
        // Select all so the placeholder copy is replaced on first keystroke.
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        clearPendingFocus();
    }, [pendingFocus, id, clearPendingFocus]);

    // Show {{tags}} as chips while not focused; the store keeps plain text.
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (document.activeElement === el) return;
        const decorated = decorateTags(html, mergeTags);
        if (el.innerHTML !== decorated) el.innerHTML = decorated;
    }, [html, mergeTags]);

    useEffect(() => {
        const el = ref.current;
        return () => {
            if (el) forgetSelection(el);
        };
    }, []);

    const Tag = tag as 'div';

    return (
        <Tag
            className={cn('outline-none focus:outline-none', className)}
            onInput={(e) => {
                const el = e.currentTarget as HTMLElement;
                // A tag typed by hand becomes a chip as soon as it is closed.
                decorateLiveTags(el, mergeTags);
                updateProperties(
                    id,
                    { text: undecorateTags(el.innerHTML) },
                    { transient: true },
                );
            }}
            onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
            }}
            onFocus={() => setActive(id)}
            onBlur={(e) => {
                rememberSelection(e.currentTarget as HTMLElement);
                commit();
            }}
            onKeyUp={(e) => rememberSelection(e.currentTarget as HTMLElement)}
            onMouseUp={(e) => rememberSelection(e.currentTarget as HTMLElement)}
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
