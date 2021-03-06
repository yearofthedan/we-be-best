import noteUpdatesSubscriptionFilter from './noteUpdatesSubscriptionFilter';
import {buildNoteResult} from '../testHelpers/queryTestDataBuilder';
import {Room} from '@type-definitions/graphql';

describe('noteUpdatesSubscriptionFilter', () => {
  it('returns true when the rooms are the same', () => {
    expect(
      noteUpdatesSubscriptionFilter(buildNoteResult({ room: {id: 'ROOM123'} as Room}), { roomId: 'ROOM123' })
    ).toBeTruthy();
  });
  it('returns false when the rooms are different', () => {
    expect(
      noteUpdatesSubscriptionFilter(buildNoteResult({ room: {id: 'ROOM123'} as Room}), { roomId: 'UNKNOWN_ROOM' })
    ).not.toBeTruthy();
  });
});
