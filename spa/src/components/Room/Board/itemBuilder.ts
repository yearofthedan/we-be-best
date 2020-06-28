import { v4 } from 'uuid';

export const DEFAULT_X = 100;
export const DEFAULT_Y = 100;

export interface Item {
  id: string;
  posX: number;
  posY: number;
  lockedBy?: string | null;
  text: string;
  style?: number | null;
  isDeleted?: boolean | null;
}

const buildItem = (): Item => ({
  id: v4(),
  posX: DEFAULT_X,
  posY: DEFAULT_Y,
  text: '',
  style: 1,
});

export default buildItem;
