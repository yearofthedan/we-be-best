export {AddRoomBoardItemInput} from '../../../spa/src/components/Room/Board/boardItemsGraphQL';

export interface ItemResult {
  id: string;
  posY: number;
  posX: number;
  lockedBy?: string;
  room: string;
  text: string;
}

export interface RoomResult {
  id: string;
  members: string[];
  items: ItemResult[];
}
