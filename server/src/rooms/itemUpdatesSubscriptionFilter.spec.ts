import {buildItemData} from '../testHelpers/storedTestDataBuilder';
import itemUpdatesSubscriptionFilter from './itemUpdatesSubscriptionFilter';

describe('itemUpdatesSubscriptionFilter', () => {
  it('returns true when the rooms are the same', () => {
    expect(
      itemUpdatesSubscriptionFilter({
        roomId: 'ROOM123',
        item: buildItemData({ id: 'ROOM123'})
      }, { roomId: 'ROOM123' })
    ).toBeTruthy();
  });
  it('returns false when the rooms are different', () => {
    expect(
      itemUpdatesSubscriptionFilter({
        roomId: 'ROOM123',
        item: buildItemData({id: 'ROOM123'})
      }, { roomId: 'UNKNOWN_ROOM' })
    ).not.toBeTruthy();
  });
});