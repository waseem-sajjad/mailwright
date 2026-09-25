import { Minus, Plus } from 'lucide-react';

import type { TableNode } from '@/types';
import {
    AlignGroup,
    Button,
    CheckBox,
    Divider,
    Field,
    Input,
    Updown,
} from '@/components/ui';
import { useNodeProps } from '@/hooks';

import { ColorField, PaddingField } from './shared';

export const TableProperty: React.FC<{ node: TableNode }> = ({ node }) => {
    const { p, set, setTransient, commit } = useNodeProps(node);
    const cols = p.rows[0]?.length ?? 0;

    const setCell = (r: number, c: number, value: string) =>
        setTransient({
            rows: p.rows.map((row, ri) =>
                ri === r
                    ? row.map((cell, ci) => (ci === c ? value : cell))
                    : row,
            ),
        });

    const addRow = () =>
        set({ rows: [...p.rows, Array.from({ length: cols }, () => '')] });
    const removeRow = () => set({ rows: p.rows.slice(0, -1) });
    const addCol = () => set({ rows: p.rows.map((row) => [...row, '']) });
    const removeCol = () =>
        set({ rows: p.rows.map((row) => row.slice(0, -1)) });

    return (
        <div className="flex flex-col gap-5 py-5">
            <Field label="Cells" stacked>
                <div className="flex flex-col gap-1.5 overflow-x-auto">
                    {p.rows.map((row, r) => (
                        // Rows are positional; index is the stable key.
                        // eslint-disable-next-line react/no-array-index-key
                        <div className="flex gap-1.5" key={r}>
                            {row.map((cell, c) => (
                                <Input
                                    onChange={(e) =>
                                        setCell(r, c, e.target.value)
                                    }
                                    className={
                                        p.headerRow && r === 0
                                            ? 'min-w-20 bg-gray-50 font-semibold'
                                            : 'min-w-20'
                                    }
                                    aria-label={`Row ${r + 1} column ${c + 1}`}
                                    onBlur={commit}
                                    value={cell}
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={c}
                                />
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={addRow} size="sm">
                        <Plus size={12} /> Row
                    </Button>
                    <Button
                        disabled={p.rows.length <= 1}
                        onClick={removeRow}
                        size="sm"
                    >
                        <Minus size={12} /> Row
                    </Button>
                    <Button disabled={cols >= 6} onClick={addCol} size="sm">
                        <Plus size={12} /> Column
                    </Button>
                    <Button disabled={cols <= 1} onClick={removeCol} size="sm">
                        <Minus size={12} /> Column
                    </Button>
                </div>
            </Field>
            <Divider />
            <Field label="First Row Is Header">
                <CheckBox
                    onChange={(headerRow) => set({ headerRow })}
                    checked={p.headerRow}
                />
            </Field>
            {p.headerRow ? (
                <>
                    <ColorField
                        onChange={(headerBackground) =>
                            setTransient({ headerBackground })
                        }
                        label="Header Background"
                        value={p.headerBackground}
                        onCommit={commit}
                    />
                    <ColorField
                        onChange={(headerColor) =>
                            setTransient({ headerColor })
                        }
                        label="Header Text Colour"
                        value={p.headerColor}
                        onCommit={commit}
                    />
                </>
            ) : null}
            <Field label="Striped Rows">
                <CheckBox
                    onChange={(stripe) => set({ stripe })}
                    checked={p.stripe}
                />
            </Field>
            {p.stripe ? (
                <ColorField
                    onChange={(stripeColor) => setTransient({ stripeColor })}
                    label="Stripe Colour"
                    value={p.stripeColor}
                    onCommit={commit}
                />
            ) : null}
            <Divider />
            <ColorField
                onChange={(borderColor) => setTransient({ borderColor })}
                label="Border Colour"
                value={p.borderColor}
                onCommit={commit}
            />
            <Field label="Border Width">
                <Updown
                    onChange={(borderWidth) => set({ borderWidth })}
                    value={p.borderWidth}
                    max={6}
                    min={0}
                />
            </Field>
            <Field label="Cell Padding">
                <Updown
                    onChange={(cellPadding) => set({ cellPadding })}
                    value={p.cellPadding}
                    max={40}
                    min={0}
                />
            </Field>
            <Field label="Font Size">
                <Updown
                    onChange={(fontSize) => set({ fontSize })}
                    value={p.fontSize}
                    max={32}
                    min={8}
                />
            </Field>
            <Field label="Width">
                <Updown
                    onChange={(width) => set({ width })}
                    value={p.width}
                    max={100}
                    min={20}
                    unit="%"
                />
            </Field>
            <Field label="Alignment">
                <AlignGroup
                    onChange={(align) => set({ align })}
                    value={p.align}
                />
            </Field>
            <Divider />
            <PaddingField node={node} />
        </div>
    );
};
