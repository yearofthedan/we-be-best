import {Item} from '../rooms/itemBuilder';
import {RoomData} from '../rooms/RoomDataSource';

export const buildItemData = (overrides: Partial<Item> = {}) => ({
    id: 'ITEM123',
    lockedBy: 'me',
    posY: 20,
    posX: 30,
    ...overrides,
});

export const buildRoomMemberData = (overrides?: string) => overrides || 'PERSON';

export const buildRoomData = (overrides: Partial<RoomData> = {}): RoomData => ({
    _id: 'internal_id',
    id: 'ROOM123',
    items: [buildItemData()],
    members: [buildRoomMemberData()],
    ...overrides
});
