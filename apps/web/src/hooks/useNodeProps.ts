import { useCallback } from 'react';

import type { EmailNode } from '@/types';

import { useEmail } from './useEmail';

/** Bound setters for the properties of one node. */
export const useNodeProps = <T extends object>(node: EmailNode<T>) => {
    const updateProperties = useEmail((s) => s.updateProperties);
    const commit = useEmail((s) => s.commit);
    const { id } = node;

    const set = useCallback(
        (partial: Partial<T>) => updateProperties<T>(id, partial),
        [id, updateProperties],
    );

    /** Keystroke / drag level updates that collapse into one undo step. */
    const setTransient = useCallback(
        (partial: Partial<T>) =>
            updateProperties<T>(id, partial, { transient: true }),
        [id, updateProperties],
    );

    return { p: node.properties, set, setTransient, commit };
};
