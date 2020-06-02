import { v4 } from 'uuid';

export interface Item {
  id: string;
  posX: number;
  posY: number;
  lockedBy?: string;
}

const buildItem = (): Item => ({
  id: v4(),
  posX: 0,
  posY: 0,
});

export default buildItem;
