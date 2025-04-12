import { IoShareSocialSharp } from 'react-icons/io5';
import { RxDividerHorizontal } from 'react-icons/rx';
import { MdTextFields } from 'react-icons/md';
import {
    LuCodeXml,
    LuColumns2,
    LuHeading,
    LuImage,
    LuListOrdered,
    LuMenu,
    LuRectangleHorizontal,
    LuRows2,
    LuVideo,
} from 'react-icons/lu';

import type { CardProps } from './card';

export const components: CardProps[] = [
    {
        component: 'layout',
        icon: <LuRows2 />,
        name: 'Row',
    },
    {
        component: 'layout',
        icon: <LuColumns2 />,
        name: 'Column',
    },
    {
        icon: <LuHeading />,
        name: 'Heading',
    },
    {
        icon: <MdTextFields />,
        name: 'Text',
    },
    {
        icon: <RxDividerHorizontal />,
        name: 'Divider',
    },
    {
        icon: <LuRectangleHorizontal />,
        name: 'Button',
    },
    {
        icon: <LuListOrdered />,
        name: 'List',
    },
    {
        icon: <LuImage />,
        name: 'Image',
    },
    {
        icon: <LuVideo />,
        name: 'Video',
    },
    {
        icon: <IoShareSocialSharp />,
        name: 'Social',
    },
    {
        icon: <LuCodeXml />,
        name: 'HTML',
    },
    {
        icon: <LuMenu />,
        name: 'Menu',
    },
];
