import {NoteViewModel} from '@/components/Room/Board/notes';
import {MemberViewModel} from '@/components/Room/members';

export const buildNoteViewModel = (overrides: Partial<NoteViewModel> = {}): NoteViewModel => ({
    id: 'NOTE123',
    lockedBy: 'me',
    posY: 20,
    posX: 30,
    text: 'placeholder text',
    style: null,
    ...overrides,
});

export const buildMemberViewModel = (overrides: Partial<MemberViewModel> = {}): MemberViewModel => ({
    id: 'MEMBER123',
    name: 'my mum',
    ...overrides
})
