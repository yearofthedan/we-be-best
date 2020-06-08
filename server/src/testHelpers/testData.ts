import {Item} from '../rooms/itemBuilder';
import {Room} from '../rooms/RoomDataSource';

export const makeItem = (overrides: Partial<Item> = {}) => ({
    id: 'ITEM123',
    lockedBy: 'me',
    posY: 20,
    posX: 30,
    ...overrides,
});

export const makeRoomMember = (overrides?: string) => overrides || 'PERSON';

export const makeRoom = (overrides: Partial<Room>): Room => ({
    id: 'ROOM123',
    items: [makeItem()],
    members: [makeRoomMember()],
    ...overrides
});
