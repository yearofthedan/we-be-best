import {ItemModel, MemberModel, RoomModel} from '../rooms/RoomsDataSource';

export const buildItemData = (overrides: Partial<ItemModel> = {}): ItemModel => ({
    id: 'ITEM123',
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

export const buildItemModel = (overrides: Partial<ItemModel> = {}): ItemModel => ({
    id: 'ITEM123',
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
    items: [buildItemModel()],
    members: [buildRoomMemberModel()],
    ...overrides,
});
