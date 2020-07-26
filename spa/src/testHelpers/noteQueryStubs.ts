import {
  addRoomBoardNote,
  lockRoomBoardNote,
  moveBoardNote,
  updateBoardNoteText,
  deleteBoardNote,
  unlockRoomBoardNote,
  updateBoardNoteStyle,
} from '@/graphql/noteQueries.graphql';
import {
  AddRoomBoardNoteInput, Note,
  MoveBoardNoteInput,
  UpdateBoardNoteStyleInput,
  UpdateBoardNoteTextInput,
} from '@type-definitions/graphql';

export const NOTE_ID = 'NOTE123';
export const ROOM_ID = 'ROOM123';
export const MY_ID = 'me';

export const buildNoteResponse = (overrides: Partial<Note> = {}): Note => ({
  __typename: 'Note',
  id: 'NOTE123',
  lockedBy: 'me',
  posY: 20,
  posX: 30,
  text: 'placeholder text',
  style: 2,
  isDeleted: null,
  ...overrides,
});

export const makeHappyMoveBoardNoteMutationStub = (inputOverrides: Partial<MoveBoardNoteInput> = {}) => {
  const successData = {
    moveBoardNote: buildNoteResponse({
      id: NOTE_ID,
      posX: 0,
      posY: 0,
      lockedBy: null,
    }),
  };
  return {
    query: moveBoardNote,
    variables: {
      input: {...inputOverrides},
    },
    successData,
  };
};

export const makeSadMoveBoardNoteMutationStub = (inputOverrides: Partial<MoveBoardNoteInput> = {}) => {
  const errorData = {
    message: 'everything is broken',
  };
  return {
    query: moveBoardNote,
    variables: {
      input: {...inputOverrides},
    },
    errorData,
  };
};

export const makeHappyLockRoomBoardNoteMutationStub = (
  inputOverrides = {},
) => {
  const successData = {
    lockRoomBoardNote: buildNoteResponse(),
  };
  return {
    query: lockRoomBoardNote,
    variables: {
      input: {
        id: 'note1',
        lockedBy: 'me',
        ...inputOverrides,
      },
    },
    successData,
  };
};

export const makeSadLockRoomBoardNoteMutationStub = (
  inputOverrides = {},
) => {
  const errorData = {
    message: 'everything is broken',
  };
  return {
    query: lockRoomBoardNote,
    variables: {
      input: {
        id: 'note1',
        lockedBy: 'me',
        ...inputOverrides,
      },
    },
    errorData,
  };
};

export const makeHappyAddRoomBoardNoteMutationStub = (
  overrides?: Partial<AddRoomBoardNoteInput>,
) => {
  const successData = {
    addRoomBoardNote: buildNoteResponse({
      id: NOTE_ID,
      posX: 0,
      posY: 0,
    }),
  };
  return {
    query: addRoomBoardNote,
    variables: {
      input: {
        noteId: NOTE_ID,
        roomId: ROOM_ID,
        ...overrides,
      },
    },
    successData,
  };
};

export const makeSadAddRoomBoardNoteMutationStub = (
  overrides?: Partial<AddRoomBoardNoteInput>,
) => {
  const errorData = {
    message: 'everything is broken',
  };
  return {
    query: addRoomBoardNote,
    variables: {
      input: {
        posX: 0,
        posY: 0,
        noteId: NOTE_ID,
        roomId: ROOM_ID,
        ...overrides,
      },
    },
    errorData,
  };
};

export const makeHappyUnlockRoomBoardNoteMutationStub = (inputOverrides = {id: 'note1'}) => {
  const successData = {
    unlockRoomBoardNote: buildNoteResponse(),
  };
  return {
    query: unlockRoomBoardNote,
    variables: {
      input: {...inputOverrides},
    },
    successData,
  };
};

export const makeSadUnlockRoomBoardNoteMutationStub = (inputOverrides = {id: 'note1'}) => {
  const errorData = {
    message: 'everything is broken',
  };
  return {
    query: unlockRoomBoardNote,
    variables: {
      input: {...inputOverrides},
    },
    errorData,
  };
};

export const makeHappyUpdateBoardNoteTextMutationStub = (
  inputOverrides: Partial<UpdateBoardNoteTextInput> = {},
) => {
  const successData = {
    updateBoardNoteText: buildNoteResponse({text: 'some content'}),
  };
  return {
    query: updateBoardNoteText,
    variables: {
      input: {
        id: 'some-id',
        text: 'some-text',
        ...inputOverrides,
      },
    },
    successData,
  };
};

export const makeSadUpdateRoomBoardNoteMutationStub = (
  inputOverrides = {},
) => {
  const errorData = {
    message: 'everything is broken',
  };
  return {
    query: updateBoardNoteText,
    variables: {
      input: {
        id: 'some-id',
        text: 'some-text',
        ...inputOverrides,
      },
    },
    errorData,
  };
};

export const makeHappyUpdateBoardNoteStyleMutationStub = (
  inputOverrides: Partial<UpdateBoardNoteStyleInput> = {},
) => {
  const successData = {
    updateBoardNoteStyle: buildNoteResponse({style: 3}),
  };
  return {
    query: updateBoardNoteStyle,
    variables: {
      input: {
        id: 'some-id',
        style: 1,
        ...inputOverrides,
      },
    },
    successData,
  };
};

export const makeSadUpdateBoardNoteStyleMutationStub = (
  inputOverrides: Partial<UpdateBoardNoteStyleInput> = {} = {},
) => {
  const errorData = {
    message: 'everything is broken',
  };
  return {
    query: updateBoardNoteStyle,
    variables: {
      input: {
        id: 'some-id',
        style: 1,
        ...inputOverrides,
      },
    },
    errorData,
  };
};

export const makeHappyDeleteBoardNoteMutationStub = (
  inputOverrides: { id?: string } = {},
) => {
  const successData = {
    deleteBoardNote: {
      id: 'some-id',
      isDeleted: true,
      ...inputOverrides,
    },
  };
  return {
    query: deleteBoardNote,
    variables: {
      id: 'some-id',
      ...inputOverrides,
    },
    successData,
  };
};

export const makeSadDeleteBoardNoteMutationStub = (
  inputOverrides: { id?: string } = {},
) => {
  const errorData = {
    message: 'everything is broken',
  };
  return {
    query: deleteBoardNote,
    variables: {
      id: 'some-id',
      ...inputOverrides,
    },
    errorData,
  };
};
