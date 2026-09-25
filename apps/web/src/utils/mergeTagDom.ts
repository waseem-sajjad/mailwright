import type { MergeTag } from '@/types';

import { MERGE_TAG_RE, mergeTagChip, ZWSP } from './mergeTags';

const chipElement = (tag: string, tags: MergeTag[]): HTMLElement => {
    const holder = document.createElement('div');
    holder.innerHTML = mergeTagChip(tag, tags);
    return holder.firstElementChild as HTMLElement;
};

/** Puts the caret directly after `node`, adding a ZWSP when needed. */
export const placeCaretAfter = (node: Node): void => {
    const selection = window.getSelection();
    if (!selection) return;
    let anchor = node.nextSibling;
    if (!(anchor instanceof Text)) {
        anchor = document.createTextNode(ZWSP);
        node.parentNode?.insertBefore(anchor, node.nextSibling);
    } else if (!anchor.data.startsWith(ZWSP)) {
        anchor.insertData(0, ZWSP);
    }
    const range = document.createRange();
    range.setStart(anchor, 1);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
};

/**
 * Converts any raw `{{tag}}` typed into a live contentEditable block into a
 * chip, then parks the caret right after the last chip created. Text nodes
 * already inside a chip are left alone.
 */
export const decorateLiveTags = (
    element: HTMLElement,
    tags: MergeTag[],
): boolean => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);

    let lastChip: HTMLElement | null = null;
    nodes.forEach((node) => {
        if (node.parentElement?.closest('.merge-tag')) return;
        const re = new RegExp(MERGE_TAG_RE.source, 'g');
        const text = node.data;
        if (!re.test(text)) return;
        re.lastIndex = 0;

        const fragment = document.createDocumentFragment();
        let cursor = 0;
        for (const match of text.matchAll(re)) {
            const index = match.index ?? 0;
            fragment.append(text.slice(cursor, index));
            const chip = chipElement(match[1], tags);
            fragment.append(chip);
            lastChip = chip;
            cursor = index + match[0].length;
        }
        fragment.append(text.slice(cursor));
        node.replaceWith(fragment);
    });

    if (!lastChip) return false;
    placeCaretAfter(lastChip);
    return true;
};
