import { v4 } from 'uuid';

export interface Item {
  id: string;
  posX: number;
  posY: number;
  lockedBy?: string;
}

const buildItem = (): Item => ({
  id: v4(),
  posX: 100,
  posY: 100,
});

export default buildItem;
