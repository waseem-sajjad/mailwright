import {
    AlertTriangle,
    Check,
    CircleX,
    Copy,
    Download,
    Monitor,
    Smartphone,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useEmail, useSettings } from '@/hooks';
import { Button, CheckBox, Modal } from '@/components/ui';
import type { Issue, SavedTemplate } from '@/utils';
import {
    applyMergeTags,
    checkDocument,
    cn,
    copyToClipboard,
    downloadFile,
    exportHtml,
    exportJson,
    loadLibrary,
    removeFromLibrary,
    saveToLibrary,
    slugify,
    templates,
} from '@/utils';

const useHtml = (minify = false) => {
    const root = useEmail((s) => s.root);
    return useMemo(() => exportHtml(root, { minify }), [root, minify]);
};

const Segmented = <T extends string>({
    value: selected,
    onChange,
    options,
}: {
    value: T;
    onChange: (value: T) => void;
    options: { value: T; label: React.ReactNode; title?: string }[];
}) => (
    <div className="flex items-center overflow-hidden rounded-xs border border-gray-300 text-xs">
        {options.map((option) => (
            <button
                className={cn(
                    'cursor-pointer px-2.5 py-1 text-gray-600 hover:bg-gray-100',
                    { 'bg-gray-100 text-blue-600': selected === option.value },
                )}
                onClick={() => onChange(option.value)}
                title={option.title ?? option.value}
                aria-label={option.title ?? option.value}
                key={option.value}
                type="button"
            >
                {option.label}
            </button>
        ))}
    </div>
);

const PreviewDialog: React.FC = () => {
    const { dialog, setDialog, view } = useSettings();
    const mergeTags = useEmail((s) => s.root.properties.mergeTags);
    const html = useHtml();
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [sample, setSample] = useState(true);

    // Open in the device the editor is currently showing.
    useEffect(() => {
        if (dialog === 'preview') {
            setDevice(view === 'mobile' ? 'mobile' : 'desktop');
        }
    }, [dialog, view]);
    const rendered = sample ? applyMergeTags(html, mergeTags) : html;

    return (
        <Modal
            actions={
                <div className="mr-2 flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        Sample data
                        <CheckBox onChange={setSample} checked={sample} />
                    </div>
                    <Segmented
                        options={[
                            {
                                value: 'desktop',
                                label: <Monitor size={14} />,
                                title: 'Desktop',
                            },
                            {
                                value: 'mobile',
                                label: <Smartphone size={14} />,
                                title: 'Mobile',
                            },
                        ]}
                        onChange={setDevice}
                        value={device}
                    />
                </div>
            }
            onClose={() => setDialog('none')}
            open={dialog === 'preview'}
            className="h-[92vh]"
            title="Preview"
        >
            <div className="flex h-full items-start justify-center bg-gray-200 p-4">
                <iframe
                    className="h-full border-0 bg-white shadow transition-[width] duration-300"
                    style={{ width: device === 'mobile' ? 375 : '100%' }}
                    title="Email preview"
                    srcDoc={rendered}
                    sandbox=""
                />
            </div>
        </Modal>
    );
};

const IssueList: React.FC<{ issues: Issue[] }> = ({ issues }) => {
    const { setActive } = useEmail();
    const { setDialog } = useSettings();
    const errors = issues.filter((i) => i.level === 'error').length;

    return (
        <aside className="flex w-72 shrink-0 flex-col border-l border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700">
                Pre-flight checks
                <span className="ml-2 font-normal text-gray-400">
                    {issues.length === 0
                        ? 'all clear'
                        : `${errors} error${errors === 1 ? '' : 's'}, ${issues.length - errors} warning${issues.length - errors === 1 ? '' : 's'}`}
                </span>
            </div>
            <ul className="flex-1 overflow-y-auto">
                {issues.length === 0 ? (
                    <li className="flex items-center gap-2 px-3 py-3 text-xs text-green-700">
                        <Check size={14} /> Ready to send.
                    </li>
                ) : null}
                {issues.map((issue, index) => (
                    <li
                        // Issues have no natural id; list is rebuilt on every change.
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                    >
                        <button
                            className={cn(
                                'flex w-full cursor-pointer items-start gap-2 border-b border-gray-100 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50',
                                { 'cursor-default': !issue.nodeId },
                            )}
                            onClick={() => {
                                if (!issue.nodeId) return;
                                setActive(issue.nodeId);
                                setDialog('none');
                            }}
                            type="button"
                        >
                            {issue.level === 'error' ? (
                                <CircleX
                                    className="mt-0.5 shrink-0 text-red-500"
                                    size={14}
                                />
                            ) : (
                                <AlertTriangle
                                    className="mt-0.5 shrink-0 text-amber-500"
                                    size={14}
                                />
                            )}
                            <span>{issue.message}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

const ExportDialog: React.FC = () => {
    const { dialog, setDialog, notify } = useSettings();
    const { root, name } = useEmail();
    const [tab, setTab] = useState<'html' | 'json'>('html');
    const [minify, setMinify] = useState(false);
    const [copied, setCopied] = useState(false);
    const html = useHtml(minify);
    const code = tab === 'html' ? html : exportJson(root, name);
    const issues = useMemo(
        () => (dialog === 'export' ? checkDocument(root) : []),
        [root, dialog],
    );

    useEffect(() => {
        if (!copied) return undefined;
        const timer = setTimeout(() => setCopied(false), 1500);
        return () => clearTimeout(timer);
    }, [copied]);

    return (
        <Modal
            actions={
                <>
                    {tab === 'html' ? (
                        <div className="mr-2 flex items-center gap-2 text-xs text-gray-600">
                            Minify
                            <CheckBox onChange={setMinify} checked={minify} />
                        </div>
                    ) : null}
                    <div className="mr-2">
                        <Segmented
                            options={[
                                { value: 'html', label: 'HTML' },
                                { value: 'json', label: 'JSON' },
                            ]}
                            onChange={setTab}
                            value={tab}
                        />
                    </div>
                    <Button
                        onClick={async () => {
                            if (await copyToClipboard(code)) {
                                setCopied(true);
                                notify(
                                    `${tab.toUpperCase()} copied to clipboard`,
                                );
                            }
                        }}
                        size="sm"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                        onClick={() =>
                            downloadFile(
                                `${slugify(name)}.${tab}`,
                                code,
                                tab === 'html'
                                    ? 'text/html'
                                    : 'application/json',
                            )
                        }
                        variant="primary"
                        size="sm"
                    >
                        <Download size={14} /> Download
                    </Button>
                </>
            }
            onClose={() => setDialog('none')}
            open={dialog === 'export'}
            className="h-[92vh]"
            title="Export"
        >
            <div className="flex h-full">
                <textarea
                    className="size-full min-w-0 flex-1 resize-none bg-gray-900 p-4 font-mono text-xs leading-5 text-gray-100 outline-none"
                    aria-label="Exported code"
                    spellCheck={false}
                    value={code}
                    readOnly
                />
                <IssueList issues={issues} />
            </div>
        </Modal>
    );
};

const TemplateCard: React.FC<{
    name: string;
    description: string;
    onSelect: () => void;
    onDelete?: () => void;
}> = ({ name, description, onSelect, onDelete }) => (
    <div className="relative">
        <button
            className="flex w-full cursor-pointer flex-col gap-1 rounded border border-gray-300 p-3 text-left transition-colors hover:border-blue-400 hover:bg-blue-50"
            onClick={onSelect}
            type="button"
        >
            <span className="pr-6 text-sm font-semibold text-gray-800">
                {name}
            </span>
            <span className="text-xs text-gray-500">{description}</span>
        </button>
        {onDelete ? (
            <button
                className="absolute top-2 right-2 cursor-pointer rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Delete ${name}`}
                onClick={onDelete}
                title="Delete"
                type="button"
            >
                <Trash2 size={14} />
            </button>
        ) : null}
    </div>
);

const TemplatesDialog: React.FC = () => {
    const { dialog, setDialog } = useSettings();
    const { load, root, name } = useEmail();
    const [tab, setTab] = useState<'starter' | 'saved'>('starter');
    const [library, setLibrary] = useState<SavedTemplate[]>([]);

    useEffect(() => {
        if (dialog === 'templates') setLibrary(loadLibrary());
    }, [dialog]);

    const confirmReplace = () => {
        if (root.children.length === 0) return true;
        // eslint-disable-next-line no-alert
        return window.confirm('Replace the current email with this template?');
    };

    const open = (next: typeof root, title: string) => {
        if (!confirmReplace()) return;
        load(next, title);
        setDialog('none');
    };

    return (
        <Modal
            actions={
                <div className="mr-2 flex items-center gap-2">
                    <Button
                        onClick={() => {
                            // eslint-disable-next-line no-alert
                            const title = window.prompt(
                                'Save current email as',
                                name,
                            );
                            if (title === null) return;
                            setLibrary(saveToLibrary(title, root));
                            setTab('saved');
                        }}
                        size="sm"
                    >
                        Save current
                    </Button>
                    <Segmented
                        options={[
                            { value: 'starter', label: 'Starter' },
                            {
                                value: 'saved',
                                label: `Saved (${library.length})`,
                                title: 'Saved',
                            },
                        ]}
                        onChange={setTab}
                        value={tab}
                    />
                </div>
            }
            onClose={() => setDialog('none')}
            open={dialog === 'templates'}
            className="max-w-3xl"
            title="Templates"
        >
            <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3">
                {tab === 'starter'
                    ? templates.map((template) => (
                          <TemplateCard
                              onSelect={() => {
                                  const built = template.build();
                                  open(built, built.properties.title);
                              }}
                              description={template.description}
                              name={template.name}
                              key={template.id}
                          />
                      ))
                    : library.map((saved) => (
                          <TemplateCard
                              onDelete={() => {
                                  // eslint-disable-next-line no-alert
                                  const ok = window.confirm(
                                      `Delete "${saved.name}"?`,
                                  );
                                  if (ok)
                                      setLibrary(removeFromLibrary(saved.id));
                              }}
                              description={`Saved ${new Date(saved.updatedAt).toLocaleString()}`}
                              onSelect={() => open(saved.root, saved.name)}
                              name={saved.name}
                              key={saved.id}
                          />
                      ))}
                {tab === 'saved' && library.length === 0 ? (
                    <p className="col-span-full py-8 text-center text-xs text-gray-400">
                        Nothing saved yet. Use “Save current” or the bookmark
                        button in the toolbar.
                    </p>
                ) : null}
            </div>
        </Modal>
    );
};

export const Dialogs: React.FC = () => (
    <>
        <PreviewDialog />
        <ExportDialog />
        <TemplatesDialog />
    </>
);
