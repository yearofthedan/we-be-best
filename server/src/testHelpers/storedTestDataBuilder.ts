import {ItemModel, RoomModel} from '../rooms/RoomsDataSource';

export const buildItemData = (overrides: Partial<ItemModel> = {}): ItemModel => ({
    id: 'ITEM123',
    lockedBy: 'me',
    posY: 20,
    posX: 30,
    text: 'some text',
    room: 'ROOM123',
    ...overrides,
});

export const buildRoomMemberData = (overrides?: string): string => overrides || 'PERSON';

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
    members: [buildRoomMemberData()],
    ...overrides,
});
