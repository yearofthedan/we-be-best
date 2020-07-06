import {ItemViewModel} from '@/components/Room/Board/items';
import {MembersViewModel} from '@/components/Room/Details/members';

export const makeItem = (overrides: Partial<ItemViewModel> = {}): ItemViewModel => ({
    id: 'ITEM123',
    lockedBy: 'me',
    posY: 20,
    posX: 30,
    text: 'placeholder text',
    style: null,
    isDeleted: null,
    ...overrides,
});

export const makeMember = (override: Partial<MembersViewModel> = {}): MembersViewModel => ({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    name: 'PERSON',
    ...override
});
