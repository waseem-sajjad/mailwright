import {
    Code2,
    Eye,
    FileDown,
    FileUp,
    LayoutTemplate,
    Monitor,
    Redo2,
    Smartphone,
    Tablet,
    Trash2,
    Undo2,
} from 'lucide-react';
import { useRef } from 'react';

import type { EmailDocument, ViewMode } from '@/types';
import { useEmail, useSettings } from '@/hooks';
import { Button } from '@/components/ui';
import { cn, downloadFile, exportJson, readFileAsText, slugify } from '@/utils';

const ViewButton: React.FC<{
    mode: ViewMode;
    icon: React.ReactNode;
    label: string;
}> = ({ mode, icon, label }) => {
    const { view, setView } = useSettings();
    return (
        <button
            className={cn(
                'h-full cursor-pointer border-r border-gray-300 px-3 text-gray-600 transition-colors duration-200 first:border-l hover:bg-white',
                { 'bg-white text-blue-600': view === mode },
            )}
            onClick={() => setView(mode)}
            aria-pressed={view === mode}
            aria-label={label}
            title={label}
            type="button"
        >
            {icon}
        </button>
    );
};

const IconButton: React.FC<
    React.ComponentPropsWithRef<'button'> & { label: string }
> = ({ label, className, children, ...props }) => (
    <button
        className={cn(
            'cursor-pointer rounded p-1.5 text-gray-600 transition-colors hover:bg-white hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40',
            className,
        )}
        aria-label={label}
        title={label}
        type="button"
        {...props}
    >
        {children}
    </button>
);

export const Header: React.FC = () => {
    const { name, setName, past, future, undo, redo, root, load, reset } =
        useEmail();
    const savedAt = useEmail((s) => s.savedAt);
    const { setDialog } = useSettings();
    const fileInput = useRef<HTMLInputElement>(null);

    const importJson = async (file: File) => {
        try {
            const text = await readFileAsText(file);
            const doc = JSON.parse(text) as EmailDocument;
            if (doc?.root?.type !== 'Canvas') throw new Error('Invalid file');
            load(doc.root, doc.name);
        } catch {
            // eslint-disable-next-line no-alert
            window.alert('That file is not a valid email template export.');
        }
    };

    return (
        <header className="flex h-10 items-center justify-between border-b border-gray-300 bg-hover">
            <section className="flex h-full flex-1 items-center gap-1 px-2">
                <input
                    className="w-56 rounded border border-transparent bg-transparent px-2 py-1 text-sm font-medium text-gray-800 outline-none hover:border-gray-300 focus:border-blue-400 focus:bg-white"
                    onChange={(e) => setName(e.target.value)}
                    aria-label="Template name"
                    placeholder="Untitled email"
                    value={name}
                />
                {savedAt ? (
                    <span className="hidden text-[11px] text-gray-400 lg:inline">
                        Saved{' '}
                        {new Date(savedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                ) : null}
            </section>

            <section className="flex h-full flex-1 items-center justify-center">
                <ViewButton
                    icon={<Monitor size={18} />}
                    label="Desktop view"
                    mode="desktop"
                />
                <ViewButton
                    icon={<Tablet size={18} />}
                    label="Tablet view"
                    mode="tablet"
                />
                <ViewButton
                    icon={<Smartphone size={18} />}
                    label="Mobile view"
                    mode="mobile"
                />
            </section>

            <section className="flex h-full flex-1 items-center justify-end gap-1 px-2">
                <IconButton
                    disabled={past.length === 0}
                    label="Undo (Ctrl+Z)"
                    onClick={undo}
                >
                    <Undo2 size={18} />
                </IconButton>
                <IconButton
                    disabled={future.length === 0}
                    label="Redo (Ctrl+Y)"
                    onClick={redo}
                >
                    <Redo2 size={18} />
                </IconButton>
                <span className="mx-1 h-5 w-px bg-gray-300" />
                <IconButton
                    onClick={() => setDialog('templates')}
                    label="Templates"
                >
                    <LayoutTemplate size={18} />
                </IconButton>
                <IconButton
                    onClick={() => fileInput.current?.click()}
                    label="Import JSON"
                >
                    <FileUp size={18} />
                </IconButton>
                <input
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) importJson(file);
                        e.target.value = '';
                    }}
                    accept="application/json,.json"
                    className="hidden"
                    ref={fileInput}
                    type="file"
                />
                <IconButton
                    onClick={() =>
                        downloadFile(
                            `${slugify(name)}.json`,
                            exportJson(root, name),
                            'application/json',
                        )
                    }
                    label="Download JSON"
                >
                    <FileDown size={18} />
                </IconButton>
                <IconButton
                    onClick={() => {
                        // eslint-disable-next-line no-alert
                        if (window.confirm('Clear the whole email?')) reset();
                    }}
                    className="hover:text-red-600"
                    label="Clear canvas"
                >
                    <Trash2 size={18} />
                </IconButton>
                <span className="mx-1 h-5 w-px bg-gray-300" />
                <Button onClick={() => setDialog('preview')} size="sm">
                    <Eye size={14} /> Preview
                </Button>
                <Button
                    onClick={() => setDialog('export')}
                    variant="primary"
                    size="sm"
                >
                    <Code2 size={14} /> Export
                </Button>
            </section>
        </header>
    );
};
