export interface Item {
  id: string;
  posX: number;
  posY: number;
  lockedBy?: string;
}

const buildItem = ({id, posX, posY}: Item): Item => ({
  id,
  posX,
  posY,
});

export default buildItem;
