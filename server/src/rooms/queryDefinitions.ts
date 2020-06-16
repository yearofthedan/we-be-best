export {AddRoomBoardItemInput} from '../../../spa/src/components/Room/boardItemsGraphQL';

export interface ItemResult {
  id: string;
  posY: number;
  posX: number;
  lockedBy?: string;
  room: string;
}

export interface RoomResult {
  id: string;
  members: string[];
  items: ItemResult[];
}
