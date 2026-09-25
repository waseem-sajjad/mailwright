import {
    Bold,
    Braces,
    Italic,
    Link as LinkIcon,
    RemoveFormatting,
    Underline,
    Unlink,
} from 'lucide-react';

import { execOnEditable, formatTag, mergeTagChip, ZWSP } from '@/utils';
import { Menu } from '@/components/ui';
import { useEmail, useSettings } from '@/hooks';

const exec = (command: string, value?: string) => {
    if (!execOnEditable(command, value)) {
        useSettings
            .getState()
            .notify(
                'Click into the text block first, then apply formatting.',
                'info',
            );
    }
};

const Btn: React.FC<{
    title: string;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ title, onClick, children }) => (
    <button
        className="cursor-pointer rounded p-1.5 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
        // Keep the contentEditable selection alive when clicking the button.
        onMouseDown={(e) => e.preventDefault()}
        aria-label={title}
        onClick={onClick}
        title={title}
        type="button"
    >
        {children}
    </button>
);

const MergeTagPicker: React.FC = () => {
    const tags = useEmail((s) => s.root.properties.mergeTags);
    return (
        <Menu
            trigger={
                <button
                    className="flex cursor-pointer items-center gap-1.5 rounded-xs border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600"
                    aria-label="Insert merge tag"
                    type="button"
                >
                    <Braces size={13} /> Insert merge tag
                </button>
            }
            className="min-w-56"
            align="start"
            preserveFocus
        >
            {tags.map((tag) => (
                <Menu.Item
                    onSelect={() =>
                        exec('insertHTML', mergeTagChip(tag.tag, tags) + ZWSP)
                    }
                    key={tag.tag}
                >
                    <span className="flex items-center justify-between gap-3">
                        {tag.label}
                        <code className="text-[10px] text-gray-400">
                            {formatTag(tag.tag)}
                        </code>
                    </span>
                </Menu.Item>
            ))}
            {tags.length === 0 ? (
                <div className="px-2.5 py-2 text-xs text-gray-400">
                    No tags defined in Body settings.
                </div>
            ) : null}
        </Menu>
    );
};

/** Inline formatting commands applied to the focused editable block. */
export const TextToolbar: React.FC = () => (
    <div className="px-4">
        <span className="mb-2 block text-xs font-medium text-gray-600">
            Formatting
            <span className="ml-1 font-light text-gray-400">
                (select text in the block first)
            </span>
        </span>
        <div className="flex w-fit items-center gap-0.5 rounded-xs border border-gray-300 bg-white p-0.5">
            <Btn onClick={() => exec('bold')} title="Bold (Ctrl+B)">
                <Bold size={14} />
            </Btn>
            <Btn onClick={() => exec('italic')} title="Italic (Ctrl+I)">
                <Italic size={14} />
            </Btn>
            <Btn onClick={() => exec('underline')} title="Underline (Ctrl+U)">
                <Underline size={14} />
            </Btn>
            <Btn
                onClick={() => {
                    // eslint-disable-next-line no-alert
                    const url = window.prompt('Link URL', 'https://');
                    if (url) exec('createLink', url);
                }}
                title="Insert link"
            >
                <LinkIcon size={14} />
            </Btn>
            <Btn onClick={() => exec('unlink')} title="Remove link">
                <Unlink size={14} />
            </Btn>
            <Btn onClick={() => exec('removeFormat')} title="Clear formatting">
                <RemoveFormatting size={14} />
            </Btn>
        </div>
        <div className="mt-2">
            <MergeTagPicker />
        </div>
    </div>
);
