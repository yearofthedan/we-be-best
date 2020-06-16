import {Item} from '@/components/Room/itemBuilder';

export const makeItem = (overrides: Partial<Item> = {}) => ({
    id: 'ITEM123',
    lockedBy: 'me',
    posY: 20,
    posX: 30,
    text: 'placeholder text',
    ...overrides,
});

export const makeRoomMember = (overrides: String) => overrides || 'PERSON';
