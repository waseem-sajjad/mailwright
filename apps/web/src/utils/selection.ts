/**
 * Remembers the last text selection inside an editable block so toolbar
 * actions (which steal focus) can put it back before running a command.
 */
let saved: { element: HTMLElement; range: Range } | null = null;

export const rememberSelection = (element: HTMLElement): void => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!element.contains(range.commonAncestorContainer)) return;
    saved = { element, range: range.cloneRange() };
};

export const forgetSelection = (element: HTMLElement): void => {
    if (saved?.element === element) saved = null;
};

/** Refocuses the remembered block and restores its selection. */
export const restoreSelection = (): boolean => {
    if (!saved || !saved.element.isConnected) return false;
    const active = document.activeElement;
    if (active === saved.element) return true;
    saved.element.focus({ preventScroll: true });
    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(saved.range);
    return true;
};

/** Runs a document command on the remembered editable block. */
export const execOnEditable = (command: string, value?: string): boolean => {
    const editable =
        document.activeElement instanceof HTMLElement &&
        document.activeElement.isContentEditable;
    if (!editable && !restoreSelection()) return false;
    document.execCommand(command, false, value);
    return true;
};

/** Inserts text at the caret of a plain input/textarea, returning the value. */
export const insertAtCaret = (
    input: HTMLInputElement | HTMLTextAreaElement,
    text: string,
): string => {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    const next = input.value.slice(0, start) + text + input.value.slice(end);
    const caret = start + text.length;
    requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(caret, caret);
    });
    return next;
};
