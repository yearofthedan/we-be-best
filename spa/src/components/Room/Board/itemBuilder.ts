import { v4 } from 'uuid';

export const DEFAULT_X = 100;
export const DEFAULT_Y = 100;
export const LIGHT_CYAN = 'hsla(182, 100%, 88%, 1)';
export const LIGHT_PINK = 'hsla(332, 92%, 80%, 1)';
export const LIGHT_ORANGE = 'hsla(29, 100%, 79%, 1)';
export const WHITEST_WHITE = 'hsla(0, 100%, 100%, 1)';
export const BLACKEST_BLACK = 'hsla(0, 0%, 0%, 1)';
export const GOLD_LEAF = 'hsla(43, 74%, 49%, 1)';

export interface Item {
  id: string;
  posX: number;
  posY: number;
  lockedBy?: string | null;
  text: string;
  isDeleted?: boolean | null;
}

const buildItem = (): Item => ({
  id: v4(),
  posX: DEFAULT_X,
  posY: DEFAULT_Y,
  text: '',
});

export default buildItem;
