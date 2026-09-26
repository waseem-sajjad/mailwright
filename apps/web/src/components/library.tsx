import { Download, ExternalLink, RefreshCw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { AdSlot } from '@/components/ads';
import { useEmail, useSettings } from '@/hooks';
import { Button, Modal } from '@/components/ui';
import type { CloudTemplate } from '@/utils/api';
import {
    errorMessage,
    getCloudTemplate,
    listCloudTemplates,
    screenshotUrl,
    templateHtmlUrl,
} from '@/utils/api';
import { cn, confirmAction, downloadFile, exportHtml, slugify } from '@/utils';

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
    onDownload: () => void;
}> = ({ template, onOpen, onDownload }) => (
    <div className="group flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-shadow hover:border-blue-300 hover:shadow-md">
        <button
            className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden bg-gray-100"
            aria-label={`Open ${template.name}`}
            onClick={onOpen}
            type="button"
        >
            <Thumbnail template={template} />
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
                    {template.prompt ?? 'Starter template'}
                </div>
            </div>
            <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <button
                    className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                    aria-label="Open"
                    onClick={onOpen}
                    title="Open in the editor"
                    type="button"
                >
                    <ExternalLink size={13} />
                </button>
                <button
                    className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                    aria-label="Download HTML"
                    onClick={onDownload}
                    title="Download HTML"
                    type="button"
                >
                    <Download size={13} />
                </button>
            </div>
        </div>
    </div>
);

/** Read-only gallery of professional templates served by the API. */
export const LibraryDialog: React.FC = () => {
    const { dialog, setDialog, notify } = useSettings();
    const { load, root } = useEmail();
    const [items, setItems] = useState<CloudTemplate[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<'recent' | 'name'>('name');
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

    const visible = useMemo(
        () =>
            [...(hits ?? items)].sort((a, b) =>
                sort === 'name'
                    ? a.name.localeCompare(b.name)
                    : b.updatedAt.localeCompare(a.updatedAt),
            ),
        [items, hits, sort],
    );

    const guard = async (fn: () => Promise<void>) => {
        try {
            await fn();
        } catch (e) {
            setError(errorMessage(e));
        }
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
                </div>
            }
            onClose={() => setDialog('none')}
            className="h-[92vh] max-w-6xl"
            title="Template gallery"
            open={open}
        >
            <div className="flex h-full flex-col">
                <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-4 py-2">
                    <div className="relative flex-1 md:max-w-xs">
                        <Search
                            className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
                            size={13}
                        />
                        <input
                            className="w-full rounded-xs border border-gray-300 py-1.5 pr-2 pl-7 text-xs outline-none focus:border-blue-400"
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search templates"
                            aria-label="Search templates"
                            value={query}
                        />
                    </div>
                    <span className="text-xs text-gray-400">
                        {visible.length} template
                        {visible.length === 1 ? '' : 's'}
                    </span>
                    <select
                        className="ml-auto rounded-xs border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-600"
                        onChange={(e) =>
                            setSort(e.target.value as 'recent' | 'name')
                        }
                        aria-label="Sort"
                        value={sort}
                    >
                        <option value="name">Name A–Z</option>
                        <option value="recent">Most recent</option>
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                    <AdSlot
                        className="mb-4"
                        format="horizontal"
                        slot={import.meta.env.VITE_ADSENSE_SLOT_LIBRARY}
                    />
                    {error ? (
                        <p className="mb-4 rounded-xs border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                            {error}
                        </p>
                    ) : null}
                    {!error && !loading && visible.length === 0 ? (
                        <p className="py-16 text-center text-xs text-gray-400">
                            {items.length === 0
                                ? 'No templates yet.'
                                : 'No templates match this search.'}
                        </p>
                    ) : null}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                        {visible.map((t) => (
                            <Card
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
