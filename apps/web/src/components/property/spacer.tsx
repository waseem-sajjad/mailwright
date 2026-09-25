import { useNodeProps } from '@/hooks';
import type { SpacerNode } from '@/types';
import { Field, Updown } from '@/components/ui';

export const SpacerProperty: React.FC<{ node: SpacerNode }> = ({ node }) => {
    const { p, set } = useNodeProps(node);

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field label="Height">
                <Updown
                    onChange={(height) => set({ height })}
                    value={p.height}
                    max={400}
                    min={1}
                />
            </Field>
        </div>
    );
};
