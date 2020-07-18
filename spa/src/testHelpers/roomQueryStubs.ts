import {itemUpdates, addMember, room, memberUpdates} from '@/graphql/roomQueries.graphql';
import {buildItemResponse} from '@/testHelpers/itemQueryStubs';
import {Item, Member, Room} from '@type-definitions/graphql';

export const buildMemberResult = (override: Partial<Member> = {}): Member => ({
  __typename: 'Member',
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  name: 'PERSON',
  room: {
    id: 'ROOM123'
  } as Room,
  ...override
});

export function makeHappyRoomItemUpdatesSubscription(
  override: { variables?: undefined; successData?: Partial<Item> } = {}
) {
  return {
    query: itemUpdates,
    successData: {
      itemUpdates: {
        ...buildItemResponse({id: 'ITEMM1234'}),
        ...override.successData,
      },
    },
  }
};

export function makeHappyRoomMemberUpdateSubscription(
  override: { variables?: undefined; successData?: Partial<Member> } = {}
) {
  return {
    query: memberUpdates,
    successData: {
      memberUpdates: buildMemberResult({id: '2', ...override.successData}),
    },
  };
}

export function makeHappyRoomQueryStub(override: { variables?: undefined; successData?: Partial<Room> } = {}) {
  return {
    query: room,
    variables: override.variables,
    successData: {
      room: {
        id: '123',
        members: [buildMemberResult({ name: 'me' })],
        items: [buildItemResponse({ id: 'ITEM1' })],
        ...override.successData,
      },
    },
  };
}

export function makeHappyAddMemberMutationStub() {
  return {
    query: addMember,
    variables: {
      input: {
        roomId: 'my-room',
        memberName: 'me',
      },
    },
    successData: {
      addMember: buildMemberResult()
    },
  };
}
export function makeSadAddMemberMutationStub() {
  return {
    query: addMember,
    variables: {
      input: {
        roomId: 'my-room',
        memberName: 'me',
      },
    },
    errorData: {
      message: 'everything is broken',
    },
  };
};
