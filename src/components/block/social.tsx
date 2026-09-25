import type { SocialNode } from '@/types';
import { paddingCss, SOCIAL_NETWORKS } from '@/utils';

const radiusFor = (shape: SocialNode['properties']['shape'], size: number) => {
    if (shape === 'circle') return size / 2;
    if (shape === 'rounded') return 6;
    return 0;
};

export const Social: React.FC<{ node: SocialNode }> = ({ node }) => {
    const p = node.properties;
    const justify = { left: 'flex-start', center: 'center', right: 'flex-end' };
    return (
        <div style={{ padding: paddingCss(p.padding) }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: justify[p.align],
                    gap: p.spacing,
                    flexWrap: 'wrap',
                }}
            >
                {p.items.map((item) => {
                    const network = SOCIAL_NETWORKS[item.network];
                    const size = p.iconSize;
                    const radius = radiusFor(p.shape, size);
                    if (item.iconUrl) {
                        return (
                            <img
                                style={{
                                    width: size,
                                    height: size,
                                    borderRadius: radius,
                                    display: 'block',
                                }}
                                src={item.iconUrl}
                                alt={network.label}
                                draggable={false}
                                key={item.id}
                            />
                        );
                    }
                    return (
                        <span
                            style={{
                                width: size,
                                height: size,
                                lineHeight: `${size}px`,
                                borderRadius: radius,
                                backgroundColor: network.color,
                                color: '#fff',
                                fontFamily: 'Arial, sans-serif',
                                fontSize: Math.round(size * 0.42),
                                fontWeight: 'bold',
                                textAlign: 'center',
                                display: 'inline-block',
                            }}
                            title={network.label}
                            key={item.id}
                        >
                            {network.short}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};
