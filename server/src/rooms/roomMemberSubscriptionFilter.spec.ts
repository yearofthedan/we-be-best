import roomMemberSubscriptionFilter from './roomMemberSubscriptionFilter';
import {buildRoomData} from '../testHelpers/storedTestDataBuilder';

describe('roomMemberSubscriptionFilter', () => {
  it('returns true when the rooms are the same', () => {
    expect(
      roomMemberSubscriptionFilter(buildRoomData({ id: 'ROOM123'}), { id: 'ROOM123' })
    ).toBeTruthy();
  });
  it('returns false when the rooms are different', () => {
    expect(
      roomMemberSubscriptionFilter(buildRoomData({ id: 'ROOM123'}), { id: 'UNKNOWN_ROOM' })
    ).not.toBeTruthy();
  });
});
