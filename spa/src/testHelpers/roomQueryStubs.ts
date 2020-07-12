import {itemUpdates, joinRoom, room, roomMemberUpdates} from '@/graphql/roomQueries.graphql';
import {buildItemResponse} from '@/testHelpers/itemQueryStubs';
import {Item, Member, Room} from '@type-definitions/graphql';

export const buildMemberResult = (override: Partial<Member> = {}): Member => ({
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  name: 'PERSON',
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
  override: { variables?: undefined; successData?: Partial<Room> } = {}
) {
  return {
    query: roomMemberUpdates,
    successData: {
      roomMemberUpdates: {
        id: '123',
        members: [
          buildMemberResult({id: '1', name: 'me'}),
          buildMemberResult({id: '2', name: 'my-mother'}),
        ],
        ...override.successData,
      },
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
export function makeHappyJoinRoomMutationStub() {
  return {
    query: joinRoom,
    variables: {
      input: {
        roomId: 'my-room',
        memberName: 'me',
      },
    },
    successData: {
      joinRoom: {
        id: 'my-room',
        members: ['me'],
        items: [],
      },
    },
  };
}
export function makeSadJoinRoomMutationStub() {
  return {
    query: joinRoom,
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
