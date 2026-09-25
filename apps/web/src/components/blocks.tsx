import { IoShareSocialSharp } from 'react-icons/io5';
import { RxDividerHorizontal } from 'react-icons/rx';
import { MdTextFields } from 'react-icons/md';
import {
    LuCodeXml,
    LuColumns2,
    LuHeading,
    LuImage,
    LuInfo,
    LuLayoutList,
    LuListOrdered,
    LuMenu,
    LuMessageSquareQuote,
    LuPanelBottom,
    LuRectangleHorizontal,
    LuRows2,
    LuSeparatorVertical,
    LuShoppingBag,
    LuTable,
    LuTicket,
    LuVideo,
} from 'react-icons/lu';

import type { ComponentType } from '@/types';

export interface BlockMeta {
    label: string;
    icon: React.ReactNode;
    group: 'layout' | 'content' | 'section' | 'none';
}

/** Registry of every block type: its label, palette icon and palette group. */
export const blockMeta: Record<ComponentType, BlockMeta> = {
    Canvas: { label: 'Body', icon: null, group: 'none' },
    Row: { label: 'Row', icon: <LuRows2 />, group: 'layout' },
    Column: { label: 'Column', icon: <LuColumns2 />, group: 'layout' },
    Heading: { label: 'Heading', icon: <LuHeading />, group: 'content' },
    Text: { label: 'Text', icon: <MdTextFields />, group: 'content' },
    Button: {
        label: 'Button',
        icon: <LuRectangleHorizontal />,
        group: 'content',
    },
    Image: { label: 'Image', icon: <LuImage />, group: 'content' },
    Divider: {
        label: 'Divider',
        icon: <RxDividerHorizontal />,
        group: 'content',
    },
    Spacer: {
        label: 'Spacer',
        icon: <LuSeparatorVertical />,
        group: 'content',
    },
    List: { label: 'List', icon: <LuListOrdered />, group: 'content' },
    Video: { label: 'Video', icon: <LuVideo />, group: 'content' },
    Social: { label: 'Social', icon: <IoShareSocialSharp />, group: 'content' },
    Menu: { label: 'Menu', icon: <LuMenu />, group: 'content' },
    HTML: { label: 'HTML', icon: <LuCodeXml />, group: 'content' },
    Table: { label: 'Table', icon: <LuTable />, group: 'section' },
    Icons: { label: 'Icon List', icon: <LuLayoutList />, group: 'section' },
    Product: { label: 'Product', icon: <LuShoppingBag />, group: 'section' },
    Quote: {
        label: 'Quote',
        icon: <LuMessageSquareQuote />,
        group: 'section',
    },
    Coupon: { label: 'Coupon', icon: <LuTicket />, group: 'section' },
    Callout: { label: 'Callout', icon: <LuInfo />, group: 'section' },
    Footer: { label: 'Footer', icon: <LuPanelBottom />, group: 'section' },
};

export const blockTypes = (group: BlockMeta['group']): ComponentType[] =>
    (Object.keys(blockMeta) as ComponentType[]).filter(
        (type) => blockMeta[type].group === group,
    );
