import { useEffect } from 'react';

import { cn } from '@/utils';

/**
 * Google AdSense. Configure in apps/web/.env:
 *   VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 *   VITE_ADSENSE_SLOT_SIDEBAR=1234567890
 *   VITE_ADSENSE_SLOT_LIBRARY=1234567890
 * Nothing renders until a client id and the slot id are set, so development
 * and self-hosted installs stay ad-free. Remember public/ads.txt.
 */
const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

declare global {
    interface Window {
        adsbygoogle?: unknown[];
    }
}

let loaderAdded = false;

const ensureLoader = (): void => {
    if (loaderAdded || !CLIENT) return;
    loaderAdded = true;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(CLIENT)}`;
    document.head.appendChild(script);
};

/** One responsive ad unit; `slot` is the AdSense ad-unit id. */
export const AdSlot: React.FC<{
    slot: string | undefined;
    className?: string;
    format?: 'auto' | 'horizontal' | 'rectangle';
}> = ({ slot, className, format = 'auto' }) => {
    useEffect(() => {
        if (!CLIENT || !slot) return;
        ensureLoader();
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
            // blocked by the browser: leave the space empty
        }
    }, [slot]);

    if (!CLIENT || !slot) return null;
    return (
        <div
            className={cn('shrink-0 overflow-hidden text-center', className)}
            data-editor-only=""
        >
            <span className="block text-[9px] tracking-wide text-gray-400 uppercase">
                Advertisement
            </span>
            <ins
                className="adsbygoogle block"
                data-full-width-responsive="true"
                data-ad-client={CLIENT}
                data-ad-format={format}
                data-ad-slot={slot}
            />
        </div>
    );
};
