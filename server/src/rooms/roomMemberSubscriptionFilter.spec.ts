import roomMemberSubscriptionFilter from './roomMemberSubscriptionFilter';
import {makeRoom} from '../testHelpers/testData';

describe('roomMemberSubscriptionFilter', () => {
  it('returns true when the rooms are the same', () => {
    expect(
      roomMemberSubscriptionFilter(makeRoom({ id: 'ROOM123'}), { id: 'ROOM123' })
    ).toBeTruthy();
  });
  it('returns false when the rooms are different', () => {
    expect(
      roomMemberSubscriptionFilter(makeRoom({ id: 'ROOM123'}), { id: 'UNKNOWN_ROOM' })
    ).not.toBeTruthy();
  });
});
