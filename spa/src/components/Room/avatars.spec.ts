import { AVATARS, getRandom } from '@/components/Room/avatars';

describe('avatars', () => {
  describe('getRandom', () => {
    it('returns one of the avatars in the list', () => {
      const result = getRandom();

      expect(AVATARS).toContain(result);
    });
  });
});
