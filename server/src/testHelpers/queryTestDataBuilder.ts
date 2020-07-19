import {
  AddRoomBoardNoteInput, Note,
  AddMemberInput,
  LockRoomBoardNoteInput, Member, MoveBoardNoteInput, Room, UnlockRoomBoardNoteInput, UpdateBoardNoteStyleInput,
  UpdateBoardNoteTextInput,
} from '@type-definitions/graphql';

export const buildAddNoteInput = (overrides: Partial<AddRoomBoardNoteInput> = {}): AddRoomBoardNoteInput => ({
  roomId: 'ROOM_123',
  noteId: 'note1',
  posX: 0,
  posY: 0,
  style: 0,
  text: '',
  ...overrides
});

export const buildUpdateBoardNoteTextInput = (overrides: Partial<UpdateBoardNoteTextInput> = {}): UpdateBoardNoteTextInput => ({
  id: 'note1',
  text: 'some text',
  ...overrides
});

export const buildUpdateBoardNoteStyleInput = (overrides: Partial<UpdateBoardNoteStyleInput> = {}): UpdateBoardNoteStyleInput => ({
  id: 'note1',
  style: 1,
  ...overrides
});

export const buildLockNoteInput = (overrides: Partial<LockRoomBoardNoteInput> = {}): LockRoomBoardNoteInput => ({
  id: 'note1',
  lockedBy: 'me-id',
  ...overrides
});

export const buildUnlockNoteInput = (overrides: Partial<UnlockRoomBoardNoteInput> = {}): UnlockRoomBoardNoteInput => ({
  id: 'note1',
  ...overrides
});

export const buildUpdateNotesInput = (overrides: Partial<MoveBoardNoteInput> = {}): MoveBoardNoteInput => ({
    id: 'NOTE_123',
    posX: 0,
    posY: 0,
  ...overrides
});

export const buildAddMemberInput = (overrides: Partial<AddMemberInput> = {}): AddMemberInput => ({
  roomId: 'ROOM_123',
  memberName: 'me',
  ...overrides
});

export const buildNoteResult = (overrides: Partial<Note> = {}): Note => ({
  id: 'NOTE_123',
  posX: 0,
  posY: 0,
  text: 'some text',
  ...overrides
});

export const buildMemberResult = (override: Partial<Member> = {}): Member => ({
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  name: 'me',
  room: {
    id: 'ROOM123'
  } as Room,
  ...override
});

export const buildRoomResult = (overrides: Partial<Room> = {}): Room => ({
  id: 'ROOM_123',
  members: [buildMemberResult()],
  notes: [buildNoteResult()],
  ...overrides
});
