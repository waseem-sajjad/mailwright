import { useEffect } from 'react';

import { useSettings } from './useSettings';
import { useEmail } from './useEmail';

const isEditable = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable
    );
};

/** Global keyboard shortcuts for the editor. */
export const useShortcuts = (): void => {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const email = useEmail.getState();
            const settings = useSettings.getState();
            const meta = event.ctrlKey || event.metaKey;
            const key = event.key.toLowerCase();

            if (key === 'escape') {
                if (settings.dialog !== 'none') {
                    settings.setDialog('none');
                } else {
                    email.setActive(null);
                }
                return;
            }

            if (meta && key === 'z' && !event.shiftKey) {
                if (isEditable(event.target)) return;
                event.preventDefault();
                email.undo();
                return;
            }

            if (
                (meta && key === 'y') ||
                (meta && key === 'z' && event.shiftKey)
            ) {
                if (isEditable(event.target)) return;
                event.preventDefault();
                email.redo();
                return;
            }

            if (isEditable(event.target)) return;

            const isRoot = email.activeId === email.root.id;

            if ((key === 'delete' || key === 'backspace') && !isRoot) {
                event.preventDefault();
                email.removeNode(email.activeId);
                return;
            }

            if (meta && key === 'd' && !isRoot) {
                event.preventDefault();
                email.duplicateNode(email.activeId);
                return;
            }

            if (meta && key === 'c' && !isRoot) {
                event.preventDefault();
                email.copyNode(email.activeId);
                return;
            }

            if (meta && key === 'v') {
                event.preventDefault();
                email.pasteNode();
                return;
            }

            if (key === 'arrowup' || key === 'arrowdown') {
                event.preventDefault();
                email.selectSibling(key === 'arrowup' ? -1 : 1);
                return;
            }

            if (key === 'arrowleft') {
                event.preventDefault();
                email.selectParent();
                return;
            }

            if (key === 'arrowright') {
                event.preventDefault();
                email.selectChild();
                return;
            }

            if (meta && key === 'p') {
                event.preventDefault();
                settings.setDialog('preview');
                return;
            }

            if (meta && key === 'e') {
                event.preventDefault();
                settings.setDialog('export');
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);
};
