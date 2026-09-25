import type { EmailNode, Padding as PaddingValue, RGBColor } from '@/types';
import { ColorPicker, Field, Padding } from '@/components/ui';
import { useNodeProps } from '@/hooks';

interface ColorFieldProps {
    label: string;
    value: RGBColor;
    onChange: (color: RGBColor) => void;
    onCommit: () => void;
}

export const ColorField: React.FC<ColorFieldProps> = ({
    label,
    value,
    onChange,
    onCommit,
}) => (
    <Field label={label}>
        <ColorPicker onChange={onChange} onCommit={onCommit} value={value} />
    </Field>
);

interface PaddingFieldProps<T> {
    node: EmailNode<T>;
    label?: string;
    valueKey?: keyof T;
    linkKey?: keyof T;
}

/** Padding editor bound to `padding` / `paddingLink` (or custom keys). */
export const PaddingField = <T extends object>({
    node,
    label,
    valueKey = 'padding' as keyof T,
    linkKey = 'paddingLink' as keyof T,
}: PaddingFieldProps<T>) => {
    const { p, set } = useNodeProps(node);
    return (
        <Padding
            onLinkChange={(link) => set({ [linkKey]: link } as Partial<T>)}
            onChange={(value) => set({ [valueKey]: value } as Partial<T>)}
            value={p[valueKey] as unknown as PaddingValue}
            link={p[linkKey] as unknown as boolean}
            label={label}
        />
    );
};
