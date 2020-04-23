import Gatherings, {Gathering} from './gatherings';

describe('gatherings', () => {
  let gatherings: Gatherings;

  beforeEach(() => {
    gatherings = new Gatherings();
  });

  describe('create', () => {
    it('registers the gathering for the id with an empty list of members', () => {
      const result = gatherings.create('id123');

      const expected: Gathering = {
        id: 'id123',
        members: new Set<string>()
      };
      expect(result).toEqual(expected);
    });

    it('responds null if I try to create a gathering which already exists', () => {
      gatherings.create('id123');
      const result = gatherings.create('id123');

      expect(result).toBeNull();
    });
  });

  describe('addMember', function () {
    it('adds a member to an empty gathering', () => {
      gatherings.create('id123');

      const result = gatherings.addMember('id123', 'juan');

      const expected: Gathering = {
        id: 'id123',
        members: new Set<string>().add('juan')
      };
      expect(result).toEqual(expected);
    });

    it('adds a member to a gathering with members', () => {
      gatherings.create('id123');
      gatherings.addMember('id123', 'juan');

      const result = gatherings.addMember('id123', 'thanh');

      const expected: Gathering = {
        id: 'id123',
        members: new Set<string>().add('juan').add('thanh')
      };
      expect(result).toEqual(expected);
    });

    it('responds null for a gathering which does not exist', () => {
      const result = gatherings.addMember('id123', 'juan');

      expect(result).toBeNull();
    });
  });
});
