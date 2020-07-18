import {ItemViewModel} from '@/components/Room/Board/items';

export const buildItemViewModel = (overrides: Partial<ItemViewModel> = {}): ItemViewModel => ({
    id: 'ITEM123',
    lockedBy: 'me',
    posY: 20,
    posX: 30,
    text: 'placeholder text',
    style: null,
    isDeleted: null,
    ...overrides,
});
