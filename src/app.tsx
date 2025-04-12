import { DndContext } from '@dnd-kit/core';

import Editor from '@/components/editor';
import Sketch from '@/components/sketch';

const App = () => (
    <DndContext>
        <Editor />
        <Sketch />
    </DndContext>
);

export default App;
