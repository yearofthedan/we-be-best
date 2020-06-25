import {
// @ts-ignore
  addRoomBoardItem, lockRoomBoardItem, moveBoardItem, updateBoardItemText, deleteBoardItem, unlockRoomBoardItem,
} from '@/components/Room/Board/boardQueries.graphql';
import {makeItem} from '@/testHelpers/testData';
import {AddRoomBoardItemInput, MoveBoardItemInput} from '../../../common/graphql';

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
    lockRoomBoardItem: makeItem(),
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
    addRoomBoardItem: {
      id: ITEM_ID,
      posX: 0,
      posY: 0,
      lockedBy: null
    },
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
    unlockRoomBoardItem: makeItem(),
  };
  return {
    query: unlockRoomBoardItem,
    variables: {
      input: { ...inputOverrides },
    },
    successData,
  };
}

export const makeHappyUpdateRoomBoardItemMutationStub = (
  inputOverrides = {}
) => {
  const successData = {
    updateBoardItemText: makeItem({ text: 'some content' })
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
