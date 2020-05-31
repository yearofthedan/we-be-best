import {Item} from '@/components/Room/RoomBoardTypes';

export const makeItem = (overrides: Partial<Item>) => ({
    id: 'ITEM123',
    lockedBy: 'me',
    posY: 20,
    posX: 30,
    ...overrides,
});
