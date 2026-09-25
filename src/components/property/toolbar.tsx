import {
    Bold,
    Italic,
    Link as LinkIcon,
    RemoveFormatting,
    Underline,
    Unlink,
} from 'lucide-react';

import { formatTag } from '@/utils';
import { useEmail } from '@/hooks';

const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
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
        <select
            className="cursor-pointer rounded-xs border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-600"
            // Keep the contentEditable selection alive when opening the picker.
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
                if (e.target.value)
                    exec('insertText', formatTag(e.target.value));
                e.target.value = '';
            }}
            aria-label="Insert merge tag"
            defaultValue=""
        >
            <option value="">Insert tag…</option>
            {tags.map((tag) => (
                <option value={tag.tag} key={tag.tag}>
                    {tag.label} {formatTag(tag.tag)}
                </option>
            ))}
        </select>
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
