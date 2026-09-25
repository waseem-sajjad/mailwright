import type { ComponentType, EmailNode } from '@/types';

import { HeadingProperty } from './heading';
import { DividerProperty } from './divider';
import { ColumnProperty } from './column';
import { CanvasProperty } from './canvas';
import { ButtonProperty } from './button';
import { SocialProperty } from './social';
import { SpacerProperty } from './spacer';
import { ImageProperty } from './image';
import { VideoProperty } from './video';
import { ListProperty } from './list';
import { HtmlProperty } from './html';
import { MenuProperty } from './menu';
import { TextProperty } from './text';
import { RowProperty } from './row';

type PropertyPanel = React.FC<{ node: EmailNode }>;

/** Maps each block type to its settings panel. */
export const propertyPanels: Record<ComponentType, PropertyPanel> = {
    Canvas: CanvasProperty as PropertyPanel,
    Row: RowProperty as PropertyPanel,
    Column: ColumnProperty as PropertyPanel,
    Heading: HeadingProperty as PropertyPanel,
    Text: TextProperty as PropertyPanel,
    Divider: DividerProperty as PropertyPanel,
    Button: ButtonProperty as PropertyPanel,
    List: ListProperty as PropertyPanel,
    Image: ImageProperty as PropertyPanel,
    Video: VideoProperty as PropertyPanel,
    Social: SocialProperty as PropertyPanel,
    HTML: HtmlProperty as PropertyPanel,
    Menu: MenuProperty as PropertyPanel,
    Spacer: SpacerProperty as PropertyPanel,
};
