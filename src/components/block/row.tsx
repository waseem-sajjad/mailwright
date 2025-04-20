import { useDroppable } from '@dnd-kit/core';

import { contentAlign, rgbaToHex } from '@/utils';
import type { RowComponentType } from '@/types';
import { useEmail } from '@/hooks';

export const Row: React.FC<{
    row: RowComponentType;
}> = ({ row }) => {
    const { setActive } = useEmail();
    const { setNodeRef } = useDroppable({
        id: row.id,
    });

    if (!row.parent) return null;

    return (
        <div
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActive(row);
            }}
            ref={setNodeRef}
            aria-hidden
        >
            <div
                style={{
                    padding: `${row.properties.paddingTop}px ${row.properties.paddingRight}px ${row.properties.paddingBottom}px ${row.properties.paddingLeft}px`,
                    backgroundColor: rgbaToHex(row.properties.backgroundColor),
                    margin: contentAlign(row.properties.contentAlign),
                    maxWidth: row.parent.properties.contentWidth,
                }}
                className="transition-all duration-300 ease-in-out"
            >
                Row
            </div>
        </div>
    );
};
