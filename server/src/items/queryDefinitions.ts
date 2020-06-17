export {
  AddRoomBoardItemInput,
  LockRoomBoardItemInput,
  MoveBoardItemInput,
  UnlockRoomBoardItemInput,
  UpdateBoardItemTextInput
} from '../../../spa/src/components/Room/Board/boardItemsGraphQL';

export interface ItemResult {
  id: string;
  posY: number;
  posX: number;
  lockedBy?: string;
  room: string;
  text: string;
}
