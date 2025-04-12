import { DragOverlay, useDndContext } from '@dnd-kit/core';

import { Card } from './card';

const Sketch = () => {
    const { active } = useDndContext();

    return (
        <DragOverlay>
            {active && (
                <Card
                    component={active.data.current!.componentType}
                    icon={active.data.current!.icon}
                    name={active.data.current!.name}
                    cardType="sketch"
                />
            )}
        </DragOverlay>
    );
};

export default Sketch;
