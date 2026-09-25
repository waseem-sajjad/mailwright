import { useEmail, useSettings, VIEW_WIDTH } from '@/hooks';
import type { RowNode } from '@/types';
import { Row } from '@/components/block';
import { Slot } from '@/components/slot';
import { cn, rgbaToCss } from '@/utils';

export const Canvas = () => {
    const root = useEmail((s) => s.root);
    const activeId = useEmail((s) => s.activeId);
    const setActive = useEmail((s) => s.setActive);
    const { view } = useSettings();
    const p = root.properties;

    return (
        <section
            className="h-full overflow-y-auto p-6 pb-40"
            onClick={() => setActive(root.id)}
            aria-hidden
        >
            <div
                className={cn(
                    'mx-auto min-h-full outline-2 -outline-offset-2 outline-transparent transition-[width,outline-color] duration-300 ease-in-out',
                    { 'outline-blue-400': activeId === root.id },
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    setActive(root.id);
                }}
                style={{
                    backgroundColor: rgbaToCss(p.backgroundColor),
                    width: VIEW_WIDTH[view],
                    color: rgbaToCss(p.color),
                    fontFamily: p.fontFamily,
                    paddingTop: 1,
                    paddingBottom: 1,
                }}
                aria-hidden
            >
                {root.children.length === 0 ? (
                    <div className="p-6">
                        <Slot
                            placeholder="Drag a Row here to start, or pick a template from the toolbar."
                            className="min-h-32"
                            parentId={root.id}
                            kind="row"
                            index={0}
                        />
                    </div>
                ) : (
                    <>
                        {root.children.map((row, index) => (
                            <div key={row.id}>
                                <Slot
                                    parentId={root.id}
                                    index={index}
                                    kind="row"
                                />
                                <Row canvas={p} row={row as RowNode} />
                            </div>
                        ))}
                        <Slot
                            index={root.children.length}
                            parentId={root.id}
                            kind="row"
                        />
                    </>
                )}
            </div>
        </section>
    );
};
