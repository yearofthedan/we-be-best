import {Item} from '@/components/Room/Board/itemBuilder';
import {Member} from '@type-definitions/graphql';
import {MemberModel} from '../../../server/src/rooms/RoomsDataSource';

export const makeItem = (overrides: Partial<Item> = {}): Item => ({
    id: 'ITEM123',
    lockedBy: 'me',
    posY: 20,
    posX: 30,
    text: 'placeholder text',
    style: null,
    isDeleted: null,
    ...overrides,
});

export const buildMemberResult = (override: Partial<Member> = {}): Member => ({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    name: 'PERSON',
    ...override
});
