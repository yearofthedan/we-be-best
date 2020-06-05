import { v4 } from 'uuid';

export const DEFAULT_X = 100;
export const DEFAULT_Y = 100;

export interface Item {
  id: string;
  posX: number;
  posY: number;
  lockedBy?: string;
}

const buildItem = (): Item => ({
  id: v4(),
  posX: DEFAULT_X,
  posY: DEFAULT_Y,
});

export default buildItem;
