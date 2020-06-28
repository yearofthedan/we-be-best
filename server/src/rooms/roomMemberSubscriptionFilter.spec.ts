import roomMemberSubscriptionFilter from './roomMemberSubscriptionFilter';
import {buildRoomResult} from '../testHelpers/queryTestDataBuilder';

describe('roomMemberSubscriptionFilter', () => {
  it('returns true when the rooms are the same', () => {
    expect(
      roomMemberSubscriptionFilter(buildRoomResult({ id: 'ROOM123'}), { id: 'ROOM123' })
    ).toBeTruthy();
  });
  it('returns false when the rooms are different', () => {
    expect(
      roomMemberSubscriptionFilter(buildRoomResult({ id: 'ROOM123'}), { id: 'UNKNOWN_ROOM' })
    ).not.toBeTruthy();
  });
});
