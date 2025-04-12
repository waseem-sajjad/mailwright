import { useCanvas, useSettings } from '@/hooks';
import { rgbaToHex } from '@/utils';

export const Canvas = () => {
    const { view, setComponent } = useSettings();
    const { styles } = useCanvas();

    return (
        <section className="h-full overflow-y-auto p-6">
            <div
                className="mx-auto transition-all duration-300 ease-in-out"
                style={{
                    backgroundColor: rgbaToHex(styles.backgroundColor),
                    width: view === 'desktop' ? '100%' : '320px',
                    color: rgbaToHex(styles.color),
                    fontFamily: styles.fontFamily,
                    fontWeight: styles.fontWeight,
                    minHeight: '100%',
                    height: 'auto',
                }}
                onClick={() => setComponent('Canvas')}
                aria-hidden
            />
        </section>
    );
};
