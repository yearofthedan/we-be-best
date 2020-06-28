import {
  addRoomBoardItem,
  lockRoomBoardItem,
  moveBoardItem,
  updateBoardItemText,
  deleteBoardItem,
  unlockRoomBoardItem,
  updateBoardItemStyle,
} from '@/graphql/boardQueries.graphql';
import {
  AddRoomBoardItemInput, Item,
  MoveBoardItemInput,
  UpdateBoardItemStyleInput,
  UpdateBoardItemTextInput,
} from '@type-definitions/graphql';

export const ITEM_ID = 'ITEM123';
export const ROOM_ID = 'ROOM123';
export const MY_ID = 'me';

const buildItemResponse = (overrides: Partial<Item> = {}): Item => ({
  __typename: 'Item',
  id: 'ITEM123',
  lockedBy: 'me',
  posY: 20,
  posX: 30,
  text: 'placeholder text',
  style: null,
  isDeleted: null,
  ...overrides,
});

export const makeHappyMoveBoardItemMutationStub = (inputOverrides: Partial<MoveBoardItemInput> = {}) => {
  const successData = {
    moveBoardItem: buildItemResponse({
      id: ITEM_ID,
      posX: 0,
      posY: 0,
      lockedBy: null
    }),
  };
  return {
    query: moveBoardItem,
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
    lockRoomBoardItem: buildItemResponse(),
  };
  return {
    query: lockRoomBoardItem,
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
    addRoomBoardItem: buildItemResponse({
      id: ITEM_ID,
      posX: 0,
      posY: 0,
      lockedBy: null
    }),
  };
  return {
    query: addRoomBoardItem,
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
    unlockRoomBoardItem: buildItemResponse(),
  };
  return {
    query: unlockRoomBoardItem,
    variables: {
      input: { ...inputOverrides },
    },
    successData,
  };
}

export const makeHappyUpdateBoardItemTextMutationStub = (
  inputOverrides: Partial<UpdateBoardItemTextInput> = {}
) => {
  const successData = {
    updateBoardItemText: buildItemResponse({ text: 'some content' })
  };
  return {
    query: updateBoardItemText,
    variables: {
      input: {
        id: 'some-id',
        text: 'some-text',
        ...inputOverrides
      },
    },
    successData,
  };
}

export const makeHappyUpdateBoardItemStyleMutationStub = (
  inputOverrides: Partial<UpdateBoardItemStyleInput> = {}
) => {
  const successData = {
    updateBoardItemStyle: buildItemResponse({ style: 3 })
  };
  return {
    query: updateBoardItemStyle,
    variables: {
      input: {
        id: 'some-id',
        style: 1,
        ...inputOverrides
      },
    },
    successData,
  };
}

export const makeSadUpdateRoomBoardItemMutationStub = (
  inputOverrides = {}
) => {
  const errorData = {
    message: 'everything is broken',
  };
  return {
    query: updateBoardItemText,
    variables: {
      input: {
        id: 'some-id',
        text: 'some-text',
        ...inputOverrides
      },
    },
    errorData,
  };
}

export const makeHappyDeleteBoardItemMutationStub = (
  inputOverrides: { id?: string} = {}
) => {
  const successData = {
    deleteBoardItem: {
      id: 'some-id',
      isDeleted: true,
      ...inputOverrides
    }
  };
  return {
    query: deleteBoardItem,
    variables: {
      id: 'some-id',
      ...inputOverrides
    },
    successData,
  };
}

export const makeSadDeleteBoardItemMutationStub = (
  inputOverrides: { id?: string } = {}
) => {
  const errorData = {
    message: 'everything is broken',
  };
  return {
    query: deleteBoardItem,
    variables: {
      id: 'some-id',
      ...inputOverrides
    },
    errorData,
  };
}
