import { X } from 'lucide-react';

import { cn } from '@/utils';

interface ModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({
    open,
    title,
    onClose,
    children,
    actions,
    className,
}) => {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
            aria-hidden
        >
            <div
                className={cn(
                    'flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-md border border-gray-300 bg-white shadow-xl',
                    className,
                )}
                onClick={(e) => e.stopPropagation()}
                aria-modal="true"
                role="dialog"
                aria-hidden
            >
                <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-hover px-4">
                    <h3 className="text-sm font-semibold text-gray-700">
                        {title}
                    </h3>
                    <div className="flex items-center gap-2">
                        {actions}
                        <button
                            className="cursor-pointer rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                            aria-label="Close"
                            onClick={onClose}
                            type="button"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </header>
                <div className="min-h-0 flex-1 overflow-auto">{children}</div>
            </div>
        </div>
    );
};
