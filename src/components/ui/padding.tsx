import { Link2, Unlink2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Updown } from './updown';

export interface PaddingProps {
    defaultValue?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };

    link: boolean;

    onChange?: (padding: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    }) => void;

    onLinkChange?: (link: boolean) => void;
}

export const Padding: React.FC<PaddingProps> = ({
    defaultValue = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    link,
    onChange,
    onLinkChange,
}) => {
    const [padding, setPadding] = useState(defaultValue);
    const [connected, setConnected] = useState(link);

    const handleAll = (val: number) => {
        setPadding({
            top: val,
            right: val,
            bottom: val,
            left: val,
        });

        onChange?.({
            top: val,
            right: val,
            bottom: val,
            left: val,
        });
    };

    useMemo(() => {
        setConnected(link);
    }, [link]);

    useMemo(() => {
        setPadding(defaultValue);
    }, [defaultValue]);

    return (
        <div className="flex flex-col gap-10 px-4">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">
                    Padding
                </span>
                <button
                    className="cursor-pointer text-gray-600 hover:text-gray-700"
                    onClick={() => {
                        setConnected((pre) => {
                            const newVal = !pre;
                            onLinkChange?.(newVal);
                            return newVal;
                        });
                    }}
                    title={connected === true ? 'Unlock' : 'Lock'}
                    aria-label="Padding"
                    type="button"
                >
                    {connected === true ? (
                        <Link2 size={16} />
                    ) : (
                        <Unlink2 size={16} />
                    )}
                </button>
            </div>
            <div className="grid grid-cols-2 grid-rows-2 gap-5">
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-light text-gray-600">
                        Top
                    </span>
                    <Updown
                        onChange={(val) => {
                            if (connected === true) {
                                handleAll(val);
                            } else {
                                setPadding({ ...padding, top: val });
                                onChange?.({ ...padding, top: val });
                            }
                        }}
                        defaultValue={padding.top}
                    />
                </div>
                <div className="flex flex-col gap-2 place-self-end">
                    <span className="text-xs font-light text-gray-600">
                        Right
                    </span>
                    <Updown
                        onChange={(val) => {
                            if (connected === true) {
                                handleAll(val);
                            } else {
                                setPadding({ ...padding, right: val });
                                onChange?.({ ...padding, right: val });
                            }
                        }}
                        defaultValue={padding.right}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-light text-gray-600">
                        Bottom
                    </span>
                    <Updown
                        onChange={(val) => {
                            if (connected === true) {
                                handleAll(val);
                            } else {
                                setPadding({ ...padding, bottom: val });
                                onChange?.({ ...padding, bottom: val });
                            }
                        }}
                        defaultValue={padding.bottom}
                    />
                </div>
                <div className="flex flex-col gap-2 place-self-end">
                    <span className="text-xs font-light text-gray-600">
                        Left
                    </span>
                    <Updown
                        onChange={(val) => {
                            if (connected === true) {
                                handleAll(val);
                            } else {
                                setPadding({ ...padding, left: val });
                                onChange?.({ ...padding, left: val });
                            }
                        }}
                        defaultValue={padding.left}
                    />
                </div>
            </div>
        </div>
    );
};
