import {
  AddRoomBoardItemInput, Item,
  JoinRoomInput,
  LockRoomBoardItemInput, Member, MoveBoardItemInput, Room, UnlockRoomBoardItemInput, UpdateBoardItemStyleInput,
  UpdateBoardItemTextInput,
} from '@type-definitions/graphql';

export const buildAddItemInput = (overrides: Partial<AddRoomBoardItemInput> = {}): AddRoomBoardItemInput => ({
  roomId: 'ROOM_123',
  itemId: 'item1',
  posX: 0,
  posY: 0,
  ...overrides
});

export const buildUpdateBoardItemTextInput = (overrides: Partial<UpdateBoardItemTextInput> = {}): UpdateBoardItemTextInput => ({
  id: 'item1',
  text: 'some text',
  ...overrides
});

export const buildUpdateBoardItemStyleInput = (overrides: Partial<UpdateBoardItemStyleInput> = {}): UpdateBoardItemStyleInput => ({
  id: 'item1',
  style: 1,
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
  roomId: 'ROOM_123',
  memberName: 'me',
  ...overrides
});

export const buildItemResult = (overrides: Partial<Item> = {}): Item => ({
  id: 'ITEM_123',
  posX: 0,
  posY: 0,
  text: 'some text',
  ...overrides
});

export const buildMemberResult = (override: Partial<Member> = {}): Member => ({
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  name: 'me',
  ...override
});

export const buildRoomResult = (overrides: Partial<Room> = {}): Room => ({
  id: 'ROOM_123',
  members: [buildMemberResult()],
  items: [buildItemResult()],
  ...overrides
});
