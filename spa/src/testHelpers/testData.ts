import {NoteViewModel} from '@/components/Room/Board/notes';

export const buildNoteViewModel = (overrides: Partial<NoteViewModel> = {}): NoteViewModel => ({
    id: 'NOTE123',
    lockedBy: 'me',
    posY: 20,
    posX: 30,
    text: 'placeholder text',
    style: null,
    isDeleted: null,
    ...overrides,
});
