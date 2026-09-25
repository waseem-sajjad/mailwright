import { Check, Copy, Download, Monitor, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useEmail, useSettings } from '@/hooks';
import { Button, Modal } from '@/components/ui';
import {
    cn,
    copyToClipboard,
    downloadFile,
    exportHtml,
    exportJson,
    slugify,
    templates,
} from '@/utils';

const useHtml = () => {
    const root = useEmail((s) => s.root);
    return useMemo(() => exportHtml(root), [root]);
};

const PreviewDialog: React.FC = () => {
    const { dialog, setDialog } = useSettings();
    const html = useHtml();
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

    return (
        <Modal
            actions={
                <div className="mr-2 flex items-center overflow-hidden rounded-xs border border-gray-300">
                    {(
                        [
                            ['desktop', <Monitor size={14} key="d" />],
                            ['mobile', <Smartphone size={14} key="m" />],
                        ] as const
                    ).map(([mode, icon]) => (
                        <button
                            className={cn(
                                'cursor-pointer px-2 py-1 text-gray-600 hover:bg-gray-100',
                                {
                                    'bg-gray-100 text-blue-600':
                                        device === mode,
                                },
                            )}
                            onClick={() => setDevice(mode)}
                            aria-label={mode}
                            type="button"
                            key={mode}
                        >
                            {icon}
                        </button>
                    ))}
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
                    sandbox=""
                    srcDoc={html}
                />
            </div>
        </Modal>
    );
};

const ExportDialog: React.FC = () => {
    const { dialog, setDialog } = useSettings();
    const { root, name } = useEmail();
    const html = useHtml();
    const [tab, setTab] = useState<'html' | 'json'>('html');
    const [copied, setCopied] = useState(false);
    const code = tab === 'html' ? html : exportJson(root, name);

    useEffect(() => {
        if (!copied) return undefined;
        const timer = setTimeout(() => setCopied(false), 1500);
        return () => clearTimeout(timer);
    }, [copied]);

    return (
        <Modal
            actions={
                <>
                    <div className="mr-2 flex items-center overflow-hidden rounded-xs border border-gray-300 text-xs">
                        {(['html', 'json'] as const).map((t) => (
                            <button
                                className={cn(
                                    'cursor-pointer px-3 py-1 text-gray-600 uppercase hover:bg-gray-100',
                                    { 'bg-gray-100 text-blue-600': tab === t },
                                )}
                                onClick={() => setTab(t)}
                                type="button"
                                key={t}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <Button
                        onClick={async () => {
                            if (await copyToClipboard(code)) setCopied(true);
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
            <textarea
                className="size-full resize-none bg-gray-900 p-4 font-mono text-xs leading-5 text-gray-100 outline-none"
                aria-label="Exported code"
                spellCheck={false}
                value={code}
                readOnly
            />
        </Modal>
    );
};

const TemplatesDialog: React.FC = () => {
    const { dialog, setDialog } = useSettings();
    const { load, root } = useEmail();

    return (
        <Modal
            onClose={() => setDialog('none')}
            open={dialog === 'templates'}
            title="Start from a template"
            className="max-w-3xl"
        >
            <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
                {templates.map((template) => (
                    <button
                        className="flex cursor-pointer flex-col gap-1 rounded border border-gray-300 p-3 text-left transition-colors hover:border-blue-400 hover:bg-blue-50"
                        onClick={() => {
                            if (
                                root.children.length > 0 &&
                                // eslint-disable-next-line no-alert
                                !window.confirm(
                                    'Replace the current email with this template?',
                                )
                            ) {
                                return;
                            }
                            const built = template.build();
                            load(built, built.properties.title);
                            setDialog('none');
                        }}
                        key={template.id}
                        type="button"
                    >
                        <span className="text-sm font-semibold text-gray-800">
                            {template.name}
                        </span>
                        <span className="text-xs text-gray-500">
                            {template.description}
                        </span>
                    </button>
                ))}
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
