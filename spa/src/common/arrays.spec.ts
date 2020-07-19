import {
  removeArrayElement,
  patchArrayElement,
  upsertArrayElement,
} from '@/common/arrays';

describe('arrays', () => {
  describe('patchArrayElement', () => {
    it('updates the note if it exists', () => {
      const array = [{ id: 1, value: 'value' }];

      const result = patchArrayElement(
        array,
        { value: 'updated value' },
        (i) => i.id === 1
      );

      expect(result).toEqual([{ id: 1, value: 'updated value' }]);
    });

    it('throws an error if the note does not exist', () => {
      expect(() =>
        patchArrayElement([] as string[], 'meh', (e) => e === '1')
      ).toThrowError();
    });
  });

  describe('removeArrayElement', () => {
    it('removes the element if it exists', () => {
      const array = [{ id: 1, value: 'value' }];

      const result = removeArrayElement(array, (i) => i.id === 1);

      expect(result).toEqual([]);
    });

    it('throws an error if the note does not exist', () => {
      expect(() =>
        removeArrayElement([], (i) => i === 'some-string')
      ).toThrowError();
    });
  });

  describe('upsertArrayElement', () => {
    it('adds the note if it does not exist', () => {
      const notes = upsertArrayElement(
        [],
        { id: 1, value: 'new value' },
        (e) => e.id === 1
      );

      expect(notes).toEqual([{ id: 1, value: 'new value' }]);
    });

    it('replaces the note if it exists', () => {
      const array = [
        { id: 1, value: 'value' },
        { id: 2, value: 'value' },
      ];
      const notes = upsertArrayElement(
        array,
        { id: 1, value: 'new value' },
        (e) => e.id === 1
      );

      expect(notes).toEqual([
        { id: 1, value: 'new value' },
        { id: 2, value: 'value' },
      ]);
    });
  });
});
