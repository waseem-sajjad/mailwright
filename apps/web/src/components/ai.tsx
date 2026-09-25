import {
    Bot,
    History,
    Loader2,
    RefreshCw,
    Sparkles,
    ThumbsDown,
    ThumbsUp,
    Wand2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { useEmail, useSettings } from '@/hooks';
import { Button, Modal, SelectBox, Textarea } from '@/components/ui';
import type { Generation, Health, HistoryItem } from '@/utils/api';
import {
    aiFeedback,
    aiGenerate,
    aiHealth,
    aiHistory,
    aiHistoryItem,
    errorMessage,
} from '@/utils/api';
import { cn } from '@/utils';

const TYPES = [
    { value: 'auto', label: 'Detect from prompt' },
    { value: 'welcome', label: 'Welcome' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'promo', label: 'Promotion / sale' },
    { value: 'event', label: 'Event invite' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'abandoned-cart', label: 'Abandoned cart' },
    { value: 'receipt', label: 'Order confirmation' },
    { value: 'feedback', label: 'Feedback request' },
    { value: 're-engagement', label: 'Win-back' },
    { value: 'invite', label: 'Invitation / referral' },
];

const TONES = [
    { value: 'auto', label: 'Detect from prompt' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'professional', label: 'Professional' },
    { value: 'playful', label: 'Playful' },
    { value: 'urgent', label: 'Urgent' },
];

const EXAMPLES = [
    'Welcome email for Bluebird Coffee, a friendly neighbourhood cafe',
    'Flash sale for Northwind online store, 30% off, urgent tone',
    'Monthly newsletter for Lumen Labs, a SaaS startup, professional',
    'Webinar invitation for an accounting firm called Ezyiah',
    'Abandoned cart reminder for a sneaker brand, playful',
];

const EngineBadge: React.FC<{
    health: Health | null;
    generation?: Generation | null;
}> = ({ health, generation }) => {
    const engine = generation?.engine ?? health?.engine;
    if (!engine) return null;
    const isModel = engine === 'model';
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                isModel
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-gray-100 text-gray-600',
            )}
            title={
                isModel
                    ? `Fine-tuned model: ${generation?.model ?? health?.model ?? ''}`
                    : 'Rules engine. Train and start the model service to use the fine-tuned model.'
            }
        >
            <Bot size={11} /> {isModel ? 'fine-tuned model' : 'rules engine'}
        </span>
    );
};

export const AiDialog: React.FC = () => {
    const { dialog, setDialog, notify } = useSettings();
    const { load } = useEmail();
    const [prompt, setPrompt] = useState('');
    const [type, setType] = useState('auto');
    const [tone, setTone] = useState('auto');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<Generation | null>(null);
    const [rated, setRated] = useState<1 | -1 | 0>(0);
    const [health, setHealth] = useState<Health | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const open = dialog === 'ai';

    useEffect(() => {
        if (!open) return;
        aiHealth()
            .then(setHealth)
            .catch(() => setHealth(null));
        aiHistory()
            .then(setHistory)
            .catch(() => setHistory([]));
    }, [open]);

    const run = async () => {
        if (prompt.trim().length < 3 || busy) return;
        setBusy(true);
        setError(null);
        setRated(0);
        try {
            const generation = await aiGenerate(prompt.trim(), { type, tone });
            setResult(generation);
            aiHistory()
                .then(setHistory)
                .catch(() => undefined);
        } catch (e) {
            setError(errorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    const rate = async (rating: 1 | -1) => {
        if (!result) return;
        setRated(rating);
        try {
            await aiFeedback(result.id, rating);
            notify(
                rating === 1
                    ? 'Thanks. This example will train the model.'
                    : 'Noted.',
                'info',
            );
        } catch (e) {
            setError(errorMessage(e));
        }
    };

    const use = () => {
        if (!result) return;
        load(result.root, result.name);
        setDialog('none');
        notify('Template loaded into the editor');
    };

    const openHistory = async (item: HistoryItem) => {
        try {
            const full = await aiHistoryItem(item.id);
            setPrompt(full.prompt);
            setResult(full);
            setRated(0);
            setShowHistory(false);
        } catch (e) {
            setError(errorMessage(e));
        }
    };

    return (
        <Modal
            actions={
                <div className="mr-2 flex items-center gap-2">
                    <EngineBadge health={health} generation={result} />
                    <Button
                        onClick={() => setShowHistory((s) => !s)}
                        variant={showHistory ? 'primary' : 'secondary'}
                        title="Recent generations"
                        size="sm"
                    >
                        <History size={14} /> History
                    </Button>
                </div>
            }
            onClose={() => setDialog('none')}
            title="Generate with AI"
            className="h-[92vh]"
            open={open}
        >
            <div className="flex h-full">
                <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-r border-gray-200 p-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-gray-600">
                            Describe the email
                        </span>
                        <Textarea
                            onKeyDown={(e) => {
                                if (
                                    (e.ctrlKey || e.metaKey) &&
                                    e.key === 'Enter'
                                )
                                    run();
                            }}
                            placeholder="e.g. Welcome email for Bluebird Coffee, a friendly cafe. Mention free pastry on first visit."
                            onChange={(e) => setPrompt(e.target.value)}
                            className="min-h-28 font-sans"
                            value={prompt}
                        />
                        <div className="flex flex-wrap gap-1">
                            {EXAMPLES.map((example) => (
                                <button
                                    className="cursor-pointer rounded-full border border-gray-200 px-2 py-0.5 text-left text-[11px] text-gray-500 hover:border-blue-400 hover:text-blue-700"
                                    onClick={() => setPrompt(example)}
                                    key={example}
                                    type="button"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-600">
                            Email type
                        </span>
                        <SelectBox
                            className="w-full"
                            onChange={setType}
                            options={TYPES}
                            value={type}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-600">
                            Tone
                        </span>
                        <SelectBox
                            className="w-full"
                            onChange={setTone}
                            options={TONES}
                            value={tone}
                        />
                    </div>
                    <Button
                        disabled={busy || prompt.trim().length < 3}
                        title="Generate (Ctrl+Enter)"
                        variant="primary"
                        onClick={run}
                    >
                        {busy ? (
                            <Loader2 className="animate-spin" size={14} />
                        ) : (
                            <Sparkles size={14} />
                        )}
                        {busy ? 'Generating…' : 'Generate template'}
                    </Button>
                    {error ? (
                        <p className="rounded-xs border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                            {error}
                        </p>
                    ) : null}
                    {health?.engine === 'rules' ? (
                        <p className="text-[11px] leading-relaxed text-gray-400">
                            Running the built-in rules engine. Fine-tune and
                            start the model service (see
                            apps/server/ai/README.md) to switch to the AI model.
                            Rate results with 👍 to grow the training set.
                        </p>
                    ) : null}
                    {result?.dsl ? (
                        <details className="text-[11px] text-gray-500">
                            <summary className="cursor-pointer">
                                Model output (DSL)
                            </summary>
                            <pre className="mt-1 max-h-48 overflow-auto rounded-xs bg-gray-900 p-2 font-mono text-[10px] leading-4 whitespace-pre-wrap text-gray-100">
                                {result.dsl}
                            </pre>
                        </details>
                    ) : null}
                </aside>

                <section className="relative flex min-w-0 flex-1 flex-col bg-gray-200">
                    {showHistory ? (
                        <div className="absolute inset-0 z-10 overflow-y-auto bg-white">
                            <div className="border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700">
                                Recent generations
                            </div>
                            {history.length === 0 ? (
                                <p className="p-4 text-xs text-gray-400">
                                    Nothing generated yet.
                                </p>
                            ) : null}
                            {history.map((item) => (
                                <button
                                    className="flex w-full cursor-pointer items-start justify-between gap-3 border-b border-gray-100 px-4 py-2.5 text-left hover:bg-gray-50"
                                    onClick={() => openHistory(item)}
                                    key={item.id}
                                    type="button"
                                >
                                    <span className="text-xs text-gray-700">
                                        {item.prompt}
                                    </span>
                                    <span className="flex shrink-0 items-center gap-2 text-[10px] text-gray-400">
                                        {item.rating === 1 ? (
                                            <ThumbsUp
                                                className="text-green-600"
                                                size={11}
                                            />
                                        ) : null}
                                        {item.rating === -1 ? (
                                            <ThumbsDown
                                                className="text-red-500"
                                                size={11}
                                            />
                                        ) : null}
                                        {item.engine}
                                        <span>
                                            {new Date(
                                                item.createdAt,
                                            ).toLocaleDateString()}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : null}

                    {result ? (
                        <>
                            <div className="flex items-center justify-between gap-2 border-b border-gray-300 bg-white px-4 py-2">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-gray-800">
                                        {result.name}
                                    </div>
                                    <div className="truncate text-[11px] text-gray-400">
                                        Preview of the generated email
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        className={cn({
                                            'border-green-500 text-green-700':
                                                rated === 1,
                                        })}
                                        title="Good result (adds to the training set)"
                                        onClick={() => rate(1)}
                                        size="sm"
                                    >
                                        <ThumbsUp size={14} />
                                    </Button>
                                    <Button
                                        className={cn({
                                            'border-red-400 text-red-600':
                                                rated === -1,
                                        })}
                                        onClick={() => rate(-1)}
                                        title="Poor result"
                                        size="sm"
                                    >
                                        <ThumbsDown size={14} />
                                    </Button>
                                    <Button
                                        disabled={busy}
                                        title="Generate again"
                                        onClick={run}
                                        size="sm"
                                    >
                                        <RefreshCw
                                            className={cn({
                                                'animate-spin': busy,
                                            })}
                                            size={14}
                                        />{' '}
                                        Retry
                                    </Button>
                                    <Button
                                        onClick={use}
                                        variant="primary"
                                        size="sm"
                                    >
                                        <Wand2 size={14} /> Use this template
                                    </Button>
                                </div>
                            </div>
                            <iframe
                                className="min-h-0 flex-1 border-0 bg-white"
                                title="Generated email preview"
                                srcDoc={result.html}
                                sandbox=""
                            />
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-gray-400">
                            <Sparkles size={40} className="text-gray-300" />
                            <p className="max-w-sm text-sm">
                                Describe the email you need and the AI drafts a
                                complete, inbox-safe template you can edit block
                                by block.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </Modal>
    );
};
