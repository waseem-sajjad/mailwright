import { Check, Info } from 'lucide-react';
import { useEffect } from 'react';

import { useSettings } from '@/hooks';
import { cn } from '@/utils';

/** Bottom-centre transient notification driven by `useSettings().toast`. */
export const Toast: React.FC = () => {
    const toast = useSettings((s) => s.toast);
    const clear = useSettings((s) => s.clearToast);

    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(clear, 2200);
        return () => clearTimeout(timer);
    }, [toast, clear]);

    if (!toast) return null;

    return (
        <div
            className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fadeUp"
            aria-live="polite"
            role="status"
        >
            <div
                className={cn(
                    'flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-medium text-white shadow-lg',
                    toast.tone === 'success' ? 'bg-gray-900' : 'bg-blue-600',
                )}
            >
                {toast.tone === 'success' ? (
                    <Check className="text-green-400" size={14} />
                ) : (
                    <Info size={14} />
                )}
                {toast.message}
            </div>
        </div>
    );
};
