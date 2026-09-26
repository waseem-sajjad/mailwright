import {
    Copy,
    Download,
    ExternalLink,
    Pencil,
    RefreshCw,
    Search,
    Sparkles,
    Trash2,
    UploadCloud,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useEmail, useSettings } from '@/hooks';
import { Button, Modal } from '@/components/ui';
import type { CloudTemplate, TemplateKind } from '@/utils/api';
import {
    deleteCloudTemplate,
    duplicateCloudTemplate,
    errorMessage,
    getCloudTemplate,
    listCloudTemplates,
    saveCloudTemplate,
    screenshotUrl,
    templateHtmlUrl,
    updateCloudTemplate,
} from '@/utils/api';
import { captureCanvas } from '@/utils/screenshot';
import { cn, confirmAction, downloadFile, exportHtml, slugify } from '@/utils';

type Filter = 'all' | TemplateKind;

const KIND_LABEL: Record<TemplateKind, string> = {
    starter: 'Starter',
    user: 'Mine',
    ai: 'AI',
};

/** Thumbnail: the stored screenshot, else a live scaled render of the HTML. */
const Thumbnail: React.FC<{ template: CloudTemplate }> = ({ template }) => {
    const shot = screenshotUrl(template);
    const [broken, setBroken] = useState(false);
    if (shot && !broken) {
        return (
            <img
                className="h-full w-full object-cover object-top"
                onError={() => setBroken(true)}
                src={shot}
                alt=""
            />
        );
    }
    return (
        <iframe
            className="pointer-events-none absolute top-0 left-0 h-[300%] w-[300%] origin-top-left scale-[0.3334] border-0"
            src={templateHtmlUrl(template)}
            title={template.name}
            sandbox=""
        />
    );
};

const Card: React.FC<{
    template: CloudTemplate;
    onOpen: () => void;
    onRename: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onDownload: () => void;
}> = ({ template, onOpen, onRename, onDuplicate, onDelete, onDownload }) => (
    <div className="group flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-shadow hover:border-blue-300 hover:shadow-md">
        <button
            className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden bg-gray-100"
            aria-label={`Open ${template.name}`}
            onClick={onOpen}
            type="button"
        >
            <Thumbnail template={template} />
            <span
                className={cn(
                    'absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-medium',
                    template.kind === 'ai' ? 'bg-violet-600 text-white' : '',
                    template.kind === 'starter' ? 'bg-gray-800 text-white' : '',
                    template.kind === 'user' ? 'bg-blue-600 text-white' : '',
                )}
            >
                {template.kind === 'ai' ? (
                    <span className="flex items-center gap-1">
                        <Sparkles size={10} /> AI
                    </span>
                ) : (
                    KIND_LABEL[template.kind]
                )}
            </span>
        </button>
        <div className="flex items-start justify-between gap-2 p-2.5">
            <div className="min-w-0">
                <div
                    className="truncate text-sm font-semibold text-gray-800"
                    title={template.name}
                >
                    {template.name}
                </div>
                <div
                    className="truncate text-[11px] text-gray-400"
                    title={template.prompt ?? ''}
                >
                    {template.prompt
                        ? `“${template.prompt}”`
                        : new Date(template.updatedAt).toLocaleString()}
                </div>
            </div>
            <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                {(
                    [
                        ['Open', <ExternalLink size={13} key="o" />, onOpen],
                        ['Rename', <Pencil size={13} key="r" />, onRename],
                        ['Duplicate', <Copy size={13} key="c" />, onDuplicate],
                        [
                            'Download HTML',
                            <Download size={13} key="d" />,
                            onDownload,
                        ],
                        ['Delete', <Trash2 size={13} key="x" />, onDelete],
                    ] as const
                ).map(([label, icon, handler]) => (
                    <button
                        className={cn(
                            'cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800',
                            {
                                'hover:text-red-600': label === 'Delete',
                            },
                        )}
                        aria-label={label}
                        onClick={handler}
                        title={label}
                        type="button"
                        key={label}
                    >
                        {icon}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

/** Server-backed template library with screenshots. */
export const LibraryDialog: React.FC = () => {
    const { dialog, setDialog, notify } = useSettings();
    const { load, root, name } = useEmail();
    const [items, setItems] = useState<CloudTemplate[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState<Filter>('all');
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<'recent' | 'name'>('recent');
    /** Server search results for the current query (name, prompt, DSL keywords). */
    const [hits, setHits] = useState<CloudTemplate[] | null>(null);
    const open = dialog === 'templates';

    const refresh = async () => {
        setLoading(true);
        try {
            setItems(await listCloudTemplates());
            setError(null);
        } catch (e) {
            setError(errorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) refresh();
    }, [open]);

    // Debounced server-side keyword search (name, prompt, DSL).
    useEffect(() => {
        const q = query.trim();
        if (!q) {
            setHits(null);
            return undefined;
        }
        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const found = await listCloudTemplates({ q, limit: 60 });
                if (!cancelled) setHits(found);
            } catch (e) {
                if (!cancelled) setError(errorMessage(e));
            }
        }, 300);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query]);

    const visible = useMemo(() => {
        return (hits ?? items)
            .filter((t) => filter === 'all' || t.kind === filter)
            .sort((a, b) =>
                sort === 'name'
                    ? a.name.localeCompare(b.name)
                    : b.updatedAt.localeCompare(a.updatedAt),
            );
    }, [items, hits, filter, sort]);

    const counts = useMemo(
        () =>
            items.reduce<Record<Filter, number>>(
                (acc, t) => ({
                    ...acc,
                    [t.kind]: acc[t.kind] + 1,
                    all: acc.all + 1,
                }),
                { all: 0, starter: 0, user: 0, ai: 0 },
            ),
        [items],
    );

    const guard = async (fn: () => Promise<void>) => {
        try {
            await fn();
        } catch (e) {
            setError(errorMessage(e));
        }
    };

    const saveCurrent = async () => {
        // eslint-disable-next-line no-alert
        const title = window.prompt('Save the current email as', name);
        if (title === null) return;
        setSaving(true);
        await guard(async () => {
            const screenshot = (await captureCanvas()) ?? undefined;
            await saveCloudTemplate({ name: title, root, screenshot });
            await refresh();
            setFilter('user');
            notify(`Saved “${title || 'Untitled'}” to the library`);
        });
        setSaving(false);
    };

    const openTemplate = (t: CloudTemplate) =>
        guard(async () => {
            if (
                root.children.length > 0 &&
                !confirmAction(`Replace the current email with “${t.name}”?`)
            )
                return;
            const full = await getCloudTemplate(t.id);
            load(full.root, full.name);
            setDialog('none');
            notify(`Opened “${full.name}”`);
        });

    return (
        <Modal
            actions={
                <div className="mr-2 flex items-center gap-2">
                    <Button
                        disabled={loading}
                        onClick={refresh}
                        title="Refresh"
                        size="sm"
                    >
                        <RefreshCw
                            className={cn({ 'animate-spin': loading })}
                            size={13}
                        />
                    </Button>
                    <Button
                        disabled={saving}
                        onClick={saveCurrent}
                        variant="primary"
                        size="sm"
                    >
                        <UploadCloud size={13} />{' '}
                        {saving ? 'Saving…' : 'Save current email'}
                    </Button>
                </div>
            }
            onClose={() => setDialog('none')}
            className="h-[92vh] max-w-6xl"
            title="Template library"
            open={open}
        >
            <div className="flex h-full flex-col">
                <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-4 py-2">
                    <div className="flex items-center overflow-hidden rounded-xs border border-gray-300 text-xs">
                        {(['all', 'starter', 'user', 'ai'] as Filter[]).map(
                            (f) => (
                                <button
                                    className={cn(
                                        'cursor-pointer px-3 py-1 text-gray-600 hover:bg-gray-100',
                                        {
                                            'bg-gray-100 text-blue-600':
                                                filter === f,
                                        },
                                    )}
                                    onClick={() => setFilter(f)}
                                    type="button"
                                    key={f}
                                >
                                    {f === 'all' ? 'All' : KIND_LABEL[f]}{' '}
                                    <span className="text-gray-400">
                                        {counts[f]}
                                    </span>
                                </button>
                            ),
                        )}
                    </div>
                    <div className="relative flex-1 md:max-w-xs">
                        <Search
                            className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
                            size={13}
                        />
                        <input
                            className="w-full rounded-xs border border-gray-300 py-1.5 pr-2 pl-7 text-xs outline-none focus:border-blue-400"
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, prompt or content"
                            aria-label="Search templates"
                            value={query}
                        />
                    </div>
                    <select
                        className="rounded-xs border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-600"
                        onChange={(e) =>
                            setSort(e.target.value as 'recent' | 'name')
                        }
                        aria-label="Sort"
                        value={sort}
                    >
                        <option value="recent">Most recent</option>
                        <option value="name">Name A–Z</option>
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                    {error ? (
                        <p className="mb-4 rounded-xs border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                            {error}
                        </p>
                    ) : null}
                    {!error && !loading && visible.length === 0 ? (
                        <p className="py-16 text-center text-xs text-gray-400">
                            {items.length === 0
                                ? 'The library is empty. Save the current email or generate one with the AI assistant.'
                                : 'No templates match this search.'}
                        </p>
                    ) : null}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                        {visible.map((t) => (
                            <Card
                                onDuplicate={() =>
                                    guard(async () => {
                                        await duplicateCloudTemplate(t.id);
                                        await refresh();
                                        notify(`Duplicated “${t.name}”`);
                                    })
                                }
                                onRename={() =>
                                    guard(async () => {
                                        // eslint-disable-next-line no-alert
                                        const next = window.prompt(
                                            'Rename template',
                                            t.name,
                                        );
                                        if (next === null || !next.trim())
                                            return;
                                        await updateCloudTemplate(t.id, {
                                            name: next.trim(),
                                        });
                                        await refresh();
                                    })
                                }
                                onDelete={() =>
                                    guard(async () => {
                                        if (
                                            !confirmAction(
                                                `Delete “${t.name}”?`,
                                            )
                                        )
                                            return;
                                        await deleteCloudTemplate(t.id);
                                        await refresh();
                                    })
                                }
                                onDownload={() =>
                                    guard(async () => {
                                        const full = await getCloudTemplate(
                                            t.id,
                                        );
                                        downloadFile(
                                            `${slugify(full.name)}.html`,
                                            exportHtml(full.root),
                                            'text/html',
                                        );
                                    })
                                }
                                onOpen={() => openTemplate(t)}
                                template={t}
                                key={t.id}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
