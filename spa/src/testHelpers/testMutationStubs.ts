import {
  ADD_ROOM_BOARD_ITEM_MUTATION,
  AddRoomBoardItemInput,
  LOCK_ROOM_BOARD_ITEM_MUTATION,
  UNLOCK_ROOM_BOARD_ITEM_MUTATION,
  UPDATE_ROOM_BOARD_ITEMS_MUTATION,
  UpdateRoomBoardItemsInput,
} from '@/components/Room/boardItemsGraphQL';

export const ITEM_ID = 'ITEM123';
export const ROOM_ID = 'ROOM123';
export const MY_ID = 'me';

export const makeHappyUpdateRoomBoardItemsMutationStub = (inputOverrides: Partial<UpdateRoomBoardItemsInput> = {}) => {
  const successData = {
    updateRoomBoardItems: {
      id: ITEM_ID,
      items: [],
    },
  };
  return {
    query: UPDATE_ROOM_BOARD_ITEMS_MUTATION,
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
    lockRoomBoardItem: {
      id: ITEM_ID,
      items: [],
    },
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
      id: ROOM_ID,
      items: [
        {
          id: ITEM_ID,
          posX: 0,
          posY: 0,
          lockedBy: null
        },
      ],
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
    unlockRoomBoardItem: {
      id: ITEM_ID,
      items: [],
    },
  };
  return {
    query: UNLOCK_ROOM_BOARD_ITEM_MUTATION,
    variables: {
      input: { ...inputOverrides },
    },
    successData,
  };
}
