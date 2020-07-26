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
}

export const mapToNoteViewModel = (note: Note): NoteViewModel => {
  return {
    id: note.id,
    posX: note.posX,
    posY: note.posY,
    lockedBy: note.lockedBy,
    text: note.text,
    style: note.style ?? 0,
  };
};

export type NotesViewModel = { [id: string]: NoteViewModel };

export const mapToNotesViewModel = (
  notes: Note[],
  initialData: NotesViewModel = {}
): NotesViewModel => {
  const workingInitial = { ...initialData };
  return notes
    .filter((note) => {
      if (note.isDeleted) {
        delete workingInitial[note.id];
        return false;
      }
      return true;
    })
    .map(mapToNoteViewModel)
    .reduce((vm, curr) => {
      vm[curr.id] = curr;
      return vm;
    }, workingInitial);
};

const makeNewNote = (): NoteViewModel => ({
  id: v4(),
  posX: DEFAULT_X,
  posY: DEFAULT_Y,
  text: '',
  style: 1,
});

export default makeNewNote;
