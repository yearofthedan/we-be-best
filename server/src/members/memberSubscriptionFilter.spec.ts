import memberSubscriptionFilter from './memberSubscriptionFilter';
import {buildMemberResult} from '@/testHelpers/queryTestDataBuilder';
import {Room} from '@type-definitions/graphql';

describe('memberSubscriptionFilter', () => {
  it('returns true when the rooms are the same', () => {
    const member = buildMemberResult({ room: {id: 'ROOM123'} as Room});
    expect(
      memberSubscriptionFilter(member, { roomId: 'ROOM123' })
    ).toBeTruthy();
  });

  it('returns false when no room exists', () => {
    const member = buildMemberResult({ room: {id: 'ROOM123'} as Room});
    expect(
      memberSubscriptionFilter(member, { roomId: 'ROOM123' })
    ).toBeTruthy();
  });

  it('returns false when the rooms are different', () => {
    const member = buildMemberResult({ room: {id: 'ROOM123'} as Room});
    expect(
      memberSubscriptionFilter(buildMemberResult(member), { roomId: 'UNKNOWN_ROOM' })
    ).not.toBeTruthy();
  });
});
