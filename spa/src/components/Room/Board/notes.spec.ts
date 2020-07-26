import { mapToNotesViewModel } from '@/components/Room/Board/notes';
import { buildNoteResponse } from '@/testHelpers/noteQueryStubs';
import { buildNoteViewModel } from '@/testHelpers/viewModelBuilders';

describe('notes', () => {
  describe('mapToNotesViewModel', () => {
    it('adds entries', () => {
      const updatedRemotely = buildNoteResponse({
        id: '123',
        lockedBy: 'me',
        posY: 20,
        posX: 30,
        text: 'placeholder text',
        style: 2,
        isDeleted: null,
      });

      const result = mapToNotesViewModel([updatedRemotely]);

      expect(result).toEqual({
        '123': {
          id: '123',
          lockedBy: 'me',
          posY: 20,
          posX: 30,
          text: 'placeholder text',
          style: 2,
        },
      });
    });

    it('replaces entries which have been updated', () => {
      const updatedRemotely = buildNoteResponse({
        id: '123',
        lockedBy: 'me',
        posY: 20,
        posX: 30,
        text: 'placeholder text',
        style: 2,
        isDeleted: null,
      });
      const existing = buildNoteViewModel({ id: '123', text: 'old text' });

      const result = mapToNotesViewModel([updatedRemotely], {
        '123': existing,
      });

      expect(result).toEqual({
        '123': {
          id: '123',
          lockedBy: 'me',
          posY: 20,
          posX: 30,
          text: 'placeholder text',
          style: 2,
        },
      });
    });
  });
});
