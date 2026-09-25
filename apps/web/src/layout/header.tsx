import {
    BookmarkPlus,
    ChevronDown,
    Code2,
    Copy,
    Download,
    Eye,
    EyeOff,
    FileDown,
    FileJson,
    FilePlus2,
    FileUp,
    LayoutTemplate,
    Monitor,
    Redo2,
    Smartphone,
    Sparkles,
    Tablet,
    Undo2,
} from 'lucide-react';
import { useMemo, useRef } from 'react';

import type { CanvasNode, EmailDocument, ViewMode } from '@/types';
import { useEmail, useSettings } from '@/hooks';
import { Button, Menu } from '@/components/ui';
import {
    checkDocument,
    cn,
    copyToClipboard,
    downloadFile,
    exportHtml,
    exportJson,
    normalizeNode,
    readFileAsText,
    saveToLibrary,
    slugify,
} from '@/utils';

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

/** Undo/redo pair. */
const History: React.FC = () => {
    const { past, future, undo, redo } = useEmail();
    return (
        <>
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
        </>
    );
};

/** File menu: templates, library, import/export JSON, new. */
const FileMenu: React.FC = () => {
    const { name, root, load, reset } = useEmail();
    const { setDialog, notify } = useSettings();
    const fileInput = useRef<HTMLInputElement>(null);

    const importJson = async (file: File) => {
        try {
            const text = await readFileAsText(file);
            const doc = JSON.parse(text) as EmailDocument;
            if (doc?.root?.type !== 'Canvas') throw new Error('Invalid file');
            load(normalizeNode(doc.root) as CanvasNode, doc.name);
            notify(`Imported “${doc.name || file.name}”`);
        } catch {
            // eslint-disable-next-line no-alert
            window.alert('That file is not a valid email template export.');
        }
    };

    return (
        <>
            <Menu
                trigger={
                    <Button
                        className="gap-1 pr-2"
                        variant="ghost"
                        title="File"
                        size="sm"
                    >
                        File <ChevronDown size={12} />
                    </Button>
                }
                align="end"
            >
                <Menu.Item
                    onSelect={() => {
                        // eslint-disable-next-line no-alert
                        if (window.confirm('Start a new blank email?')) {
                            reset();
                            notify('New email', 'info');
                        }
                    }}
                    icon={<FilePlus2 size={14} />}
                >
                    New blank email
                </Menu.Item>
                <Menu.Item
                    onSelect={() => setDialog('templates')}
                    icon={<LayoutTemplate size={14} />}
                >
                    Templates…
                </Menu.Item>
                <Menu.Item
                    onSelect={() => {
                        // eslint-disable-next-line no-alert
                        const title = window.prompt('Save to library as', name);
                        if (title === null) return;
                        saveToLibrary(title, root);
                        notify(
                            `Saved “${title || 'Untitled template'}” to library`,
                        );
                    }}
                    icon={<BookmarkPlus size={14} />}
                >
                    Save to library
                </Menu.Item>
                <Menu.Separator />
                <Menu.Label>JSON</Menu.Label>
                <Menu.Item
                    onSelect={() => fileInput.current?.click()}
                    icon={<FileUp size={14} />}
                >
                    Import…
                </Menu.Item>
                <Menu.Item
                    onSelect={() => {
                        downloadFile(
                            `${slugify(name)}.json`,
                            exportJson(root, name),
                            'application/json',
                        );
                        notify('JSON downloaded');
                    }}
                    icon={<FileDown size={14} />}
                >
                    Download
                </Menu.Item>
            </Menu>
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
        </>
    );
};

/** Export split button: main action opens the dialog; caret has shortcuts. */
const ExportButton: React.FC = () => {
    const { name, root } = useEmail();
    const { setDialog, notify } = useSettings();
    const errors = useMemo(
        () => checkDocument(root).filter((i) => i.level === 'error').length,
        [root],
    );

    const copyHtml = async () => {
        const ok = await copyToClipboard(exportHtml(root));
        notify(
            ok ? 'HTML copied to clipboard' : 'Copy failed',
            ok ? 'success' : 'info',
        );
    };

    const downloadHtml = () => {
        downloadFile(`${slugify(name)}.html`, exportHtml(root), 'text/html');
        notify('HTML downloaded');
    };

    return (
        <div className="relative flex items-stretch">
            <Button
                className="rounded-r-none"
                onClick={() => setDialog('export')}
                title="Export HTML (Ctrl+E)"
                variant="primary"
                size="sm"
            >
                <Code2 size={14} /> Export
            </Button>
            <Menu
                trigger={
                    <Button
                        className="rounded-l-none border-l-blue-500 px-1.5"
                        aria-label="Export options"
                        title="Export options"
                        variant="primary"
                        size="sm"
                    >
                        <ChevronDown size={14} />
                    </Button>
                }
            >
                <Menu.Item
                    onSelect={() => setDialog('export')}
                    icon={<Code2 size={14} />}
                    shortcut="Ctrl+E"
                >
                    Open export panel
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item onSelect={copyHtml} icon={<Copy size={14} />}>
                    Copy HTML
                </Menu.Item>
                <Menu.Item
                    onSelect={downloadHtml}
                    icon={<Download size={14} />}
                >
                    Download HTML
                </Menu.Item>
                <Menu.Item
                    onSelect={() => {
                        downloadFile(
                            `${slugify(name)}.json`,
                            exportJson(root, name),
                            'application/json',
                        );
                        notify('JSON downloaded');
                    }}
                    icon={<FileJson size={14} />}
                >
                    Download JSON
                </Menu.Item>
            </Menu>
            {errors > 0 ? (
                <span
                    className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-hover"
                    title={`${errors} pre-flight error${errors === 1 ? '' : 's'}`}
                >
                    {errors}
                </span>
            ) : null}
        </div>
    );
};

export const Header: React.FC = () => {
    const { name, setName } = useEmail();
    const savedAt = useEmail((s) => s.savedAt);
    const { setDialog, showHidden, setShowHidden } = useSettings();

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
                <button
                    className={cn(
                        'ml-2 flex h-7 cursor-pointer items-center gap-1 rounded border px-2 text-[11px] transition-colors',
                        showHidden
                            ? 'border-gray-300 bg-white text-gray-600 hover:text-gray-900'
                            : 'border-amber-300 bg-amber-50 text-amber-700',
                    )}
                    title={
                        showHidden
                            ? 'Hidden blocks are shown dimmed. Click to collapse them.'
                            : 'Hidden blocks are collapsed. Click to show them dimmed.'
                    }
                    onClick={() => setShowHidden(!showHidden)}
                    aria-pressed={!showHidden}
                    type="button"
                >
                    {showHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span className="hidden xl:inline">
                        {showHidden ? 'Showing hidden' : 'Hidden collapsed'}
                    </span>
                </button>
            </section>

            <section className="flex h-full flex-1 items-center justify-end gap-1.5 px-3">
                <History />
                <span className="mx-1 h-5 w-px bg-gray-300" />
                <FileMenu />
                <Button
                    className="border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100"
                    onClick={() => setDialog('ai')}
                    title="Generate a template with AI"
                    size="sm"
                >
                    <Sparkles size={14} /> AI
                </Button>
                <Button
                    onClick={() => setDialog('preview')}
                    title="Preview (Ctrl+P)"
                    size="sm"
                >
                    <Eye size={14} /> Preview
                </Button>
                <ExportButton />
            </section>
        </header>
    );
};
