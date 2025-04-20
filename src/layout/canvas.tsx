import type { CanvasComponentType } from '@/types';
import { DropZone } from '@/components/dropzone';
import { useEmail, useSettings } from '@/hooks';
import { Row } from '@/components/block';
import { rgbaToHex } from '@/utils';

export const Canvas = () => {
    const { components, setActive } = useEmail();
    const { view } = useSettings();

    return (
        <section className="h-full overflow-y-auto p-6">
            {components?.map((component: CanvasComponentType) => (
                <div
                    className="mx-auto transition-all duration-300 ease-in-out"
                    onClick={() => setActive(component)}
                    style={{
                        backgroundColor: rgbaToHex(
                            component.properties.backgroundColor,
                        ),
                        width: view === 'desktop' ? '100%' : '320px',
                        color: rgbaToHex(component.properties.color),
                        fontFamily: component.properties.fontFamily,
                        fontWeight: component.properties.fontWeight,
                        minHeight: '100%',
                        height: 'auto',
                    }}
                    key={component.id}
                    aria-hidden
                >
                    {component.children.length === 0 && (
                        <DropZone component={component} />
                    )}
                    {component.children?.map((props) => (
                        <Row key={props.id} {...props} />
                    ))}
                </div>
            ))}
        </section>
    );
};
