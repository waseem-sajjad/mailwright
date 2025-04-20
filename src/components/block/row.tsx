import type { RowComponentType } from '@/types';

export const Row: React.FC<RowComponentType> = ({ id, name }) => (
    <div id={id}>{name}</div>
);
