import { v4 } from 'uuid';
import { Item } from '@type-definitions/graphql';

export const DEFAULT_X = 100;
export const DEFAULT_Y = 100;

export interface ItemViewModel {
  id: string;
  posX: number;
  posY: number;
  lockedBy?: string | null;
  text: string;
  style?: number | null;
  isDeleted?: boolean | null;
  isNew?: boolean | null;
}

export const mapToItemsViewModel = (items: Item[]): ItemViewModel[] => {
  return items.map((i) => {
    return {
      id: i.id,
      posX: i.posX,
      posY: i.posY,
      lockedBy: i.lockedBy,
      text: i.text,
      style: i.style,
      isDeleted: i.isDeleted,
      isNew: null,
    };
  });
};

const makeNewItem = (): ItemViewModel => ({
  id: v4(),
  posX: DEFAULT_X,
  posY: DEFAULT_Y,
  text: '',
  style: 1,
  isNew: true,
});

export default makeNewItem;
