import {NoteModel, MemberModel, RoomModel} from '../rooms/RoomsDataSource';

export const buildNoteData = (overrides: Partial<NoteModel> = {}): NoteModel => ({
    id: 'NOTE123',
    lockedBy: 'me',
    posY: 20,
    posX: 30,
    text: 'some text',
    room: 'ROOM123',
    ...overrides,
});

export const buildRoomMemberModel = (overrides: Partial<MemberModel> = {}): MemberModel => ({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    name:  'PERSON',
    room: 'ROOM123',
    ...overrides,
});

export const buildNoteModel = (overrides: Partial<NoteModel> = {}): NoteModel => ({
    id: 'NOTE123',
    lockedBy: 'me',
    posY: 20,
    posX: 30,
    text: 'some text',
    room: 'ROOM123',
    ...overrides,
});

export const buildRoomModel = (overrides: Partial<RoomModel> = {}): RoomModel => ({
    _id: 'internal_id',
    id: 'ROOM123',
    notes: [buildNoteModel()],
    members: [buildRoomMemberModel()],
    ...overrides,
});
