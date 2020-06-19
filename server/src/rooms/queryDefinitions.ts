export {AddRoomBoardItemInput} from '../../../spa/src/components/Room/Board/boardItemsGraphQL';

export interface ItemResult {
  id: string;
  posY: number;
  posX: number;
  lockedBy?: string;
  room: string;
  text: string;
  isDeleted?: boolean;
}

export interface RoomResult {
  id: string;
  members: string[];
  items: ItemResult[];
}
