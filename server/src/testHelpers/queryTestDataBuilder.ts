import {AddRoomBoardItemInput, ItemResult, RoomResult} from '../rooms/queryDefinitions';
import {
  LockRoomBoardItemInput,
  UnlockRoomBoardItemInput,
  MoveBoardItemInput,
} from '../../../spa/src/components/Room/boardItemsGraphQL';
import {JoinRoomInput} from '../../../spa/src/components/Room/roomGraphQLQuery';

export const buildAddItemInput = (overrides: Partial<AddRoomBoardItemInput> = {}): AddRoomBoardItemInput => ({
  roomId: 'ROOM_123',
  itemId: 'item1',
  posX: 0,
  posY: 0,
  ...overrides
});

export const buildLockItemInput = (overrides: Partial<LockRoomBoardItemInput> = {}): LockRoomBoardItemInput => ({
  id: 'item1',
  lockedBy: 'me-id',
  ...overrides
});

export const buildUnlockItemInput = (overrides: Partial<UnlockRoomBoardItemInput> = {}): UnlockRoomBoardItemInput => ({
  id: 'item1',
  ...overrides
});

export const buildUpdateItemsInput = (overrides: Partial<MoveBoardItemInput> = {}): MoveBoardItemInput => ({
    id: 'ITEM_123',
    posX: 0,
    posY: 0,
  ...overrides
});

export const buildJoinRoomInput = (overrides: Partial<JoinRoomInput> = {}): JoinRoomInput => ({
  roomName: 'ROOM_123',
  memberName: 'me',
  ...overrides
});

export const buildItemResult = (overrides: Partial<ItemResult> = {}): ItemResult => ({
  id: 'ITEM_123',
  posX: 0,
  posY: 0,
  ...overrides
});

export const buildMemberResult = (override?: string) => override || 'me';

export const buildRoomResult = (overrides: Partial<RoomResult> = {}): RoomResult => ({
  id: 'ROOM_123',
  members: [buildMemberResult()],
  items: [buildItemResult()],
  ...overrides
});
