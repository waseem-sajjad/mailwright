import type { SpacerNode } from '@/types';

export const Spacer: React.FC<{ node: SpacerNode }> = ({ node }) => (
    <div
        className="bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(59,130,246,0.08)_6px,rgba(59,130,246,0.08)_12px)]"
        style={{ height: node.properties.height }}
    />
);
