import { cn, isKnownTag, MERGE_TAG_RE, tagLabel } from '@/utils';
import { useEmail } from '@/hooks';

/** Renders plain text with `{{tags}}` shown as chips (editor only). */
export const TagText: React.FC<{ text: string }> = ({ text }) => {
    const tags = useEmail((s) => s.root.properties.mergeTags);
    const parts = text.split(new RegExp(`(${MERGE_TAG_RE.source})`, 'g'));

    return (
        <>
            {parts.map((part, index) => {
                // split() with a capture group yields: text, match, tag, text…
                if (index % 3 === 2) return null;
                if (index % 3 === 1) {
                    const tag = parts[index + 1];
                    return (
                        <span
                            className={cn('merge-tag', {
                                'merge-tag--unknown': !isKnownTag(tag, tags),
                            })}
                            // Parts are positional; index is the stable key.
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            title={part}
                        >
                            {tagLabel(tag, tags)}
                        </span>
                    );
                }
                // eslint-disable-next-line react/no-array-index-key
                return <span key={index}>{part}</span>;
            })}
        </>
    );
};
