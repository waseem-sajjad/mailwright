import {
    BookMarked,
    Bot,
    Check,
    Code2,
    Copy,
    ExternalLink,
    Loader2,
    RotateCcw,
    Send,
    Sparkles,
    ThumbsDown,
    ThumbsUp,
    Trash2,
    Wand2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { type ChatMessage, useChat, useEmail, useSettings } from '@/hooks';
import { Button, SelectBox } from '@/components/ui';
import {
    aiFeedback,
    aiHealth,
    type CloudTemplate,
    copyToClipboard,
    exportHtml,
    getCloudTemplate,
    type Health,
    saveCloudTemplate,
    screenshotUrl,
    templateHtmlUrl,
} from '@/utils/api-bridge';
import { cn, confirmAction } from '@/utils';

const TYPES = [
    { value: 'auto', label: 'Any type' },
    { value: 'welcome', label: 'Welcome' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'promo', label: 'Promotion' },
    { value: 'event', label: 'Event' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'abandoned-cart', label: 'Abandoned cart' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'feedback', label: 'Feedback' },
    { value: 're-engagement', label: 'Win-back' },
    { value: 'invite', label: 'Invite' },
];

const TONES = [
    { value: 'auto', label: 'Any tone' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'professional', label: 'Professional' },
    { value: 'playful', label: 'Playful' },
    { value: 'urgent', label: 'Urgent' },
];

const SIZES = [
    { value: 'standard', label: 'Standard length' },
    { value: 'large', label: 'Large (10–14 sections)' },
];

const STARTERS = [
    'Welcome email for Bluebird Coffee, a friendly cafe',
    'Flash sale for Northwind, 30% off, urgent',
    'Monthly newsletter for a SaaS startup',
    'Webinar invite for an accounting firm',
];

const FOLLOW_UPS = [
    'Make the header dark',
    'Add a coupon SAVE15',
    'Use a professional tone',
    'Change the button text to "Get started"',
    'Suggest subject lines',
    'Make it shorter',
    'Find similar templates',
];

/** Small scaled iframe so the chat shows the real email, not a mock. */
const Thumb: React.FC<{ html: string; onClick: () => void }> = ({
    html,
    onClick,
}) => (
    <button
        className="relative block h-40 w-full cursor-pointer overflow-hidden rounded border border-gray-200 bg-white hover:border-blue-400"
        aria-label="Open preview"
        onClick={onClick}
        type="button"
    >
        <iframe
            className="pointer-events-none absolute top-0 left-0 h-[400%] w-[400%] origin-top-left scale-[0.25] border-0"
            title="Template preview"
            srcDoc={html}
            sandbox=""
        />
    </button>
);

/** The compact template DSL behind a generation, with a copy button. */
const DslView: React.FC<{ dsl: string }> = ({ dsl }) => {
    const [copied, setCopied] = useState(false);
    return (
        <div className="relative mt-2">
            <pre className="max-h-56 overflow-auto rounded bg-gray-900 p-2 pr-8 font-mono text-[10px] leading-snug whitespace-pre-wrap text-gray-100">
                {dsl}
            </pre>
            <button
                className="absolute top-1 right-1 cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                onClick={async () => {
                    if (await copyToClipboard(dsl)) {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1200);
                    }
                }}
                aria-label="Copy DSL"
                title="Copy DSL"
                type="button"
            >
                {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
        </div>
    );
};

/** A library template found by the chat, with its stored screenshot or a live render. */
const LibraryHit: React.FC<{ template: CloudTemplate; onOpen: () => void }> = ({
    template,
    onOpen,
}) => {
    const shot = screenshotUrl(template);
    return (
        <li className="flex items-center gap-2 rounded border border-gray-200 bg-white p-1.5">
            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                {shot ? (
                    <img
                        className="h-full w-full object-cover object-top"
                        src={shot}
                        alt=""
                    />
                ) : (
                    <iframe
                        className="pointer-events-none absolute top-0 left-0 h-[500%] w-[500%] origin-top-left scale-[0.2] border-0"
                        src={templateHtmlUrl(template)}
                        title={template.name}
                        sandbox=""
                    />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-gray-800">
                    {template.name}
                </div>
                <div className="truncate text-[10px] text-gray-400">
                    {template.kind}
                    {template.score !== undefined
                        ? ` · ${Math.round(template.score * 100)}% match`
                        : ''}
                    {template.prompt ? ` · ${template.prompt}` : ''}
                </div>
            </div>
            <button
                className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                aria-label={`Open ${template.name}`}
                onClick={onOpen}
                title="Open in the editor"
                type="button"
            >
                <ExternalLink size={13} />
            </button>
        </li>
    );
};

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const { load, root } = useEmail();
    const { setDialog, notify, setPreviewHtml } = useSettings();
    const rate = useChat((s) => s.rate);
    const [copied, setCopied] = useState<string | null>(null);
    const [showDsl, setShowDsl] = useState(false);
    const [saved, setSaved] = useState<string | null>(null);
    const mine = message.role === 'user';
    const g = message.generation;
    const context = useChat((s) => s.context);

    const saveToLibrary = async () => {
        if (!g || saved) return;
        try {
            const row = await saveCloudTemplate({
                name: g.name,
                root: g.root,
                prompt: context?.prompt ?? message.text,
                dsl: g.dsl,
            });
            setSaved(row.id);
            notify(`Saved “${row.name}” to the library`);
        } catch {
            notify('Could not save to the library', 'info');
        }
    };

    const openTemplate = async (t: CloudTemplate) => {
        if (
            root.children.length > 0 &&
            !confirmAction(`Replace the current email with “${t.name}”?`)
        )
            return;
        try {
            const full = await getCloudTemplate(t.id);
            load(full.root, full.name);
            notify(`Opened “${full.name}”`);
        } catch {
            notify('Could not open that template', 'info');
        }
    };

    const apply = () => {
        if (!g) return;

        if (
            root.children.length > 0 &&
            !confirmAction('Replace the current email with this template?')
        )
            return;
        load(g.root, g.name);
        notify('Template loaded into the editor');
    };

    const appendRows = () => {
        if (!g) return;
        load({ ...root, children: [...root.children, ...g.root.children] });
        notify('Rows added below the current email');
    };

    const vote = async (rating: 1 | -1) => {
        if (!g) return;
        rate(message.id, rating);
        try {
            await aiFeedback(g.id, rating);
            if (rating === 1) notify('Thanks for the feedback.', 'info');
        } catch {
            // feedback is best-effort
        }
    };

    return (
        <div
            className={cn(
                'flex flex-col gap-1.5',
                mine ? 'items-end' : 'items-start',
            )}
        >
            <div
                className={cn(
                    'max-w-[92%] rounded-lg px-3 py-2 text-xs leading-relaxed',
                    mine
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800 ring-1 ring-gray-200',
                    message.error ? 'bg-red-50 text-red-700 ring-red-200' : '',
                )}
            >
                {message.text}
            </div>

            {g ? (
                <div className="w-full rounded-lg bg-white p-2 ring-1 ring-gray-200">
                    <Thumb
                        onClick={() => {
                            setPreviewHtml(g.html || exportHtml(g.root));
                            setDialog('preview');
                        }}
                        html={g.html || exportHtml(g.root)}
                    />
                    <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <div className="truncate text-xs font-semibold text-gray-800">
                                {g.name}
                            </div>
                            <div className="text-[10px] text-gray-400">
                                {g.engine === 'gemini'
                                    ? `Gemini${g.model ? ` · ${g.model.replace(/^models\//, '')}` : ''}`
                                    : 'rules engine'}
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <button
                                className={cn(
                                    'cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-violet-600',
                                    { 'text-violet-600': showDsl },
                                )}
                                onClick={() => setShowDsl((v) => !v)}
                                aria-pressed={showDsl}
                                aria-label="Show DSL"
                                title="Show the template DSL"
                                type="button"
                            >
                                <Code2 size={13} />
                            </button>
                            <button
                                className={cn(
                                    'cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-green-600',
                                    {
                                        'text-green-600': g.rating === 1,
                                    },
                                )}
                                title="Good result (trains the model)"
                                aria-label="Good result"
                                onClick={() => vote(1)}
                                type="button"
                            >
                                <ThumbsUp size={13} />
                            </button>
                            <button
                                className={cn(
                                    'cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500',
                                    {
                                        'text-red-500': g.rating === -1,
                                    },
                                )}
                                aria-label="Poor result"
                                onClick={() => vote(-1)}
                                title="Poor result"
                                type="button"
                            >
                                <ThumbsDown size={13} />
                            </button>
                        </div>
                    </div>
                    {g.references && g.references.length > 0 ? (
                        <div className="mt-1 truncate text-[10px] text-gray-400">
                            Inspired by{' '}
                            {g.references.map((r) => r.name).join(', ')}{' '}
                            (pgvector)
                        </div>
                    ) : null}
                    {showDsl ? <DslView dsl={g.dsl} /> : null}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        <Button onClick={apply} variant="primary" size="sm">
                            <Wand2 size={12} /> Apply to editor
                        </Button>
                        <Button
                            onClick={appendRows}
                            title="Keep the current email and add these rows at the end"
                            size="sm"
                        >
                            Add rows below
                        </Button>
                        <Button
                            onClick={saveToLibrary}
                            title="Store this template (with its DSL) in the library"
                            disabled={saved !== null}
                            size="sm"
                        >
                            <BookMarked size={12} />{' '}
                            {saved ? 'Saved' : 'Save to library'}
                        </Button>
                    </div>
                </div>
            ) : null}

            {message.templates && message.templates.length > 0 ? (
                <ul className="flex w-full flex-col gap-1">
                    {message.templates.map((t) => (
                        <LibraryHit
                            onOpen={() => openTemplate(t)}
                            template={t}
                            key={t.id}
                        />
                    ))}
                </ul>
            ) : null}

            {message.subjects ? (
                <div className="w-full rounded-lg bg-white p-2 ring-1 ring-gray-200">
                    <div className="mb-1 text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                        Subject lines
                    </div>
                    <ul className="flex flex-col gap-1">
                        {[
                            ...message.subjects.subjects,
                            ...message.subjects.preheaders.map(
                                (p) => `Preheader: ${p}`,
                            ),
                        ].map((line) => (
                            <li
                                className="flex items-center justify-between gap-2 text-xs text-gray-700"
                                key={line}
                            >
                                <span>{line}</span>
                                <button
                                    className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                                    onClick={async () => {
                                        if (
                                            await copyToClipboard(
                                                line.replace(
                                                    /^Preheader: /,
                                                    '',
                                                ),
                                            )
                                        ) {
                                            setCopied(line);
                                            setTimeout(
                                                () => setCopied(null),
                                                1200,
                                            );
                                        }
                                    }}
                                    aria-label="Copy"
                                    title="Copy"
                                    type="button"
                                >
                                    {copied === line ? (
                                        <Check size={12} />
                                    ) : (
                                        <Copy size={12} />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
};

/** Chat-style AI assistant living in the left sidebar. */
export const ChatPanel: React.FC = () => {
    const {
        messages,
        pending,
        send,
        clear,
        options,
        setOptions,
        context,
        resetContext,
    } = useChat();
    const [draft, setDraft] = useState('');
    const [showContextDsl, setShowContextDsl] = useState(false);
    const [health, setHealth] = useState<Health | null>(null);
    const bottom = useRef<HTMLDivElement>(null);

    useEffect(() => {
        aiHealth()
            .then(setHealth)
            .catch(() => setHealth(null));
    }, []);

    useEffect(() => {
        bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages.length, pending]);

    const submit = () => {
        const text = draft.trim();
        if (!text || pending) return;
        setDraft('');
        send(text);
    };

    const chips = context ? FOLLOW_UPS : STARTERS;

    return (
        <div className="flex h-full flex-col bg-gray-50">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2">
                <div className="flex items-center gap-2 text-xs">
                    <span className="flex size-6 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                        <Bot size={14} />
                    </span>
                    <div>
                        <div className="font-semibold text-gray-800">
                            AI assistant
                        </div>
                        <div className="text-[10px] text-gray-400">
                            {health === null ? 'server offline' : null}
                            {health?.engine === 'gemini'
                                ? `Gemini · ${health.model?.replace(/^models\//, '')}`
                                : null}
                            {health?.engine === 'rules'
                                ? 'rules engine · set GEMINI_API_KEY for Gemini'
                                : null}
                            {health?.embeddings?.ok
                                ? ` · vectors: ${health.embeddings.model}`
                                : ''}
                        </div>
                    </div>
                </div>
                <button
                    className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 disabled:opacity-30"
                    disabled={messages.length === 0}
                    aria-label="Clear conversation"
                    title="Clear conversation"
                    onClick={clear}
                    type="button"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-3">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                        <Sparkles className="text-violet-400" size={28} />
                        <p className="text-xs text-gray-500">
                            Describe the email you need. Then refine it in plain
                            words: “make the header dark”, “add a coupon”,
                            “professional tone”.
                        </p>
                    </div>
                ) : null}
                {messages.map((m) => (
                    <Message message={m} key={m.id} />
                ))}
                {pending ? (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Loader2 className="animate-spin" size={14} /> Thinking…
                    </div>
                ) : null}
                <div ref={bottom} />
            </div>

            <div className="border-t border-gray-200 bg-white p-2">
                {context ? (
                    <div className="mb-2 rounded border border-violet-200 bg-violet-50 px-2 py-1.5 text-[11px] text-violet-900">
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="shrink-0" size={12} />
                            <span className="min-w-0 flex-1 truncate">
                                <span className="font-semibold">Context:</span>{' '}
                                “{context.prompt}”
                                {context.steps.length > 0
                                    ? ` · ${context.steps.length} change${context.steps.length === 1 ? '' : 's'}`
                                    : ''}
                            </span>
                            <button
                                className={cn(
                                    'cursor-pointer rounded p-0.5 text-violet-500 hover:bg-violet-100 hover:text-violet-800',
                                    { 'text-violet-800': showContextDsl },
                                )}
                                onClick={() => setShowContextDsl((v) => !v)}
                                aria-pressed={showContextDsl}
                                aria-label="Show current DSL"
                                title="Show the DSL the next change starts from"
                                type="button"
                            >
                                <Code2 size={12} />
                            </button>
                            <button
                                className="cursor-pointer rounded p-0.5 text-violet-500 hover:bg-violet-100 hover:text-violet-800"
                                onClick={() => {
                                    setShowContextDsl(false);
                                    resetContext();
                                }}
                                aria-label="Start a new template"
                                title="Start a new template (keeps the conversation)"
                                type="button"
                            >
                                <RotateCcw size={12} />
                            </button>
                        </div>
                        {context.steps.length > 0 ? (
                            <ol className="mt-1 list-decimal pl-4 text-[10px] text-violet-700">
                                {context.steps.slice(-4).map((step) => (
                                    <li className="truncate" key={step}>
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        ) : null}
                        {showContextDsl ? <DslView dsl={context.dsl} /> : null}
                    </div>
                ) : null}
                <div className="mb-2 flex flex-wrap gap-1">
                    {chips.map((chip) => (
                        <button
                            className="cursor-pointer rounded-full border border-gray-200 px-2 py-0.5 text-[11px] text-gray-500 hover:border-violet-400 hover:text-violet-700"
                            onClick={() => send(chip)}
                            disabled={pending}
                            key={chip}
                            type="button"
                        >
                            {chip}
                        </button>
                    ))}
                </div>
                <div className="mb-2 grid grid-cols-3 gap-1.5">
                    <SelectBox
                        className="w-full"
                        onChange={(type) => setOptions({ type })}
                        options={TYPES}
                        value={options.type ?? 'auto'}
                    />
                    <SelectBox
                        className="w-full"
                        onChange={(tone) => setOptions({ tone })}
                        options={TONES}
                        value={options.tone ?? 'auto'}
                    />
                    <SelectBox
                        className="w-full"
                        onChange={(size) =>
                            setOptions({ size: size as 'standard' | 'large' })
                        }
                        options={SIZES}
                        value={options.size ?? 'standard'}
                    />
                </div>
                <div className="flex items-end gap-1.5">
                    <textarea
                        className="max-h-32 min-h-10 flex-1 resize-none rounded-xs border border-gray-300 px-2.5 py-2 text-xs outline-none focus:border-violet-400"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                submit();
                            }
                        }}
                        placeholder={
                            context
                                ? 'What should change? (Enter to send)'
                                : 'Describe the email… (Enter to send)'
                        }
                        onChange={(e) => setDraft(e.target.value)}
                        aria-label="Message"
                        value={draft}
                        rows={2}
                    />
                    <Button
                        className="h-10 border-violet-600 bg-violet-600 hover:bg-violet-700"
                        disabled={pending || !draft.trim()}
                        aria-label="Send"
                        variant="primary"
                        onClick={submit}
                        title="Send"
                    >
                        {pending ? (
                            <Loader2 className="animate-spin" size={14} />
                        ) : (
                            <Send size={14} />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
