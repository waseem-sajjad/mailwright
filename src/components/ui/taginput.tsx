import { Braces } from 'lucide-react';
import { useRef } from 'react';

import { formatTag, insertAtCaret } from '@/utils';
import { useEmail } from '@/hooks';

import { Input, type InputProps } from './input';
import { Menu } from './menu';

interface TagInputProps extends Omit<InputProps, 'onChange' | 'value'> {
    value: string;
    onValueChange: (value: string) => void;
}

/** Text input with a trailing button that inserts a merge tag at the caret. */
export const TagInput: React.FC<TagInputProps> = ({
    value,
    onValueChange,
    className,
    ...props
}) => {
    const ref = useRef<HTMLInputElement>(null);
    const tags = useEmail((s) => s.root.properties.mergeTags);

    return (
        <div className="relative w-full">
            <Input
                onChange={(e) => onValueChange(e.target.value)}
                className={className ? `${className} pr-8` : 'pr-8'}
                value={value}
                ref={ref}
                {...props}
            />
            <Menu
                trigger={
                    <button
                        className="absolute top-1/2 right-1 -translate-y-1/2 cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                        aria-label="Insert merge tag"
                        title="Insert merge tag"
                        type="button"
                    >
                        <Braces size={13} />
                    </button>
                }
                className="min-w-56"
            >
                <Menu.Label>Insert merge tag</Menu.Label>
                {tags.map((tag) => (
                    <Menu.Item
                        onSelect={() => {
                            const input = ref.current;
                            const text = formatTag(tag.tag);
                            onValueChange(
                                input
                                    ? insertAtCaret(input, text)
                                    : value + text,
                            );
                        }}
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
        </div>
    );
};
