import {
  ADD_ROOM_BOARD_ITEM_MUTATION,
  AddRoomBoardItemInput,
  LOCK_ROOM_BOARD_ITEM_MUTATION,
  UNLOCK_ROOM_BOARD_ITEM_MUTATION,
  MOVE_BOARD_ITEM_MUTATION,
  MoveBoardItemInput,
} from '@/components/Room/boardItemsGraphQL';
import {makeItem} from '@/testHelpers/testData';

export const ITEM_ID = 'ITEM123';
export const ROOM_ID = 'ROOM123';
export const MY_ID = 'me';

export const makeHappyMoveBoardItemMutationStub = (inputOverrides: Partial<MoveBoardItemInput> = {}) => {
  const successData = {
    moveBoardItem: {
      id: ITEM_ID,
      posX: 0,
      posY: 0,
      lockedBy: null
    },
  };
  return {
    query: MOVE_BOARD_ITEM_MUTATION,
    variables: {
      input: { ...inputOverrides },
    },
    successData,
  };
}
export const makeHappyLockRoomBoardItemMutationStub = (
  inputOverrides = {
    id: 'item1',
    lockedBy: 'me',
  }
) => {
  const successData = {
    lockRoomBoardItem: makeItem(),
  };
  return {
    query: LOCK_ROOM_BOARD_ITEM_MUTATION,
    variables: {
      input: { ...inputOverrides },
    },
    successData,
  };
}

export const makeHappyAddRoomBoardItemMutationStub = (
  overrides?: Partial<AddRoomBoardItemInput>
) => {
  const successData = {
    addRoomBoardItem: {
      id: ITEM_ID,
      posX: 0,
      posY: 0,
      lockedBy: null
    },
  };
  return {
    query: ADD_ROOM_BOARD_ITEM_MUTATION,
    variables: {
      input: {
        posX: 0,
        posY: 0,
        itemId: ITEM_ID,
        roomId: ROOM_ID,
        ...overrides,
      },
    },
    successData,
  };
}

export const makeHappyUnlockRoomBoardItemMutationStub = (inputOverrides = { id: 'item1' }) => {
  const successData = {
    unlockRoomBoardItem: makeItem(),
  };
  return {
    query: UNLOCK_ROOM_BOARD_ITEM_MUTATION,
    variables: {
      input: { ...inputOverrides },
    },
    successData,
  };
}