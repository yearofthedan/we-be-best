import { v4 } from 'uuid';
import { Note } from '@type-definitions/graphql';

export const DEFAULT_X = 100;
export const DEFAULT_Y = 100;

export interface NoteViewModel {
  id: string;
  posX: number;
  posY: number;
  lockedBy?: string | null;
  text: string;
  style: number;
  isNew?: boolean | null;
}

export const mapToNoteViewModel = (notes: Note): NoteViewModel => {
  return {
    id: notes.id,
    posX: notes.posX,
    posY: notes.posY,
    lockedBy: notes.lockedBy,
    text: notes.text,
    style: notes.style ?? 0,
    isNew: null,
  };
};

export type NotesViewModel = { [id: string]: NoteViewModel };

export const mapToNotesViewModel = (notes: Note[]): NotesViewModel => {
  return notes
    .filter((note) => !note.isDeleted)
    .map(mapToNoteViewModel)
    .reduce((vm, curr) => {
      vm[curr.id] = curr;
      return vm;
    }, {} as NotesViewModel);
};

const makeNewNote = (): NoteViewModel => ({
  id: v4(),
  posX: DEFAULT_X,
  posY: DEFAULT_Y,
  text: '',
  style: 1,
  isNew: true,
});

export default makeNewNote;
