import type { BaseComponent, CanvasProperties } from '@/types';
import { useEmail, useSettings } from '@/hooks';
import { rgbaToHex } from '@/utils';

export const Canvas = () => {
    const { components, setActive } = useEmail();
    const { view } = useSettings();

    return (
        <section className="h-full overflow-y-auto p-6">
            {components?.map((component: BaseComponent<CanvasProperties>) => (
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
                />
            ))}
        </section>
    );
};
