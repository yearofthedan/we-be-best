import itemUpdatesSubscriptionFilter from './itemUpdatesSubscriptionFilter';
import {buildItemResult} from '../testHelpers/queryTestDataBuilder';
import {Room} from '@type-definitions/graphql';

describe('itemUpdatesSubscriptionFilter', () => {
  it('returns true when the rooms are the same', () => {
    expect(
      itemUpdatesSubscriptionFilter(buildItemResult({ room: {id: 'ROOM123'} as Room}), { roomId: 'ROOM123' })
    ).toBeTruthy();
  });
  it('returns false when the rooms are different', () => {
    expect(
      itemUpdatesSubscriptionFilter(buildItemResult({ room: {id: 'ROOM123'} as Room}), { roomId: 'UNKNOWN_ROOM' })
    ).not.toBeTruthy();
  });
});
