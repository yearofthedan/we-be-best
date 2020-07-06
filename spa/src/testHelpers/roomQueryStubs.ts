import {itemUpdates, joinRoom, room, roomMemberUpdates} from '@/graphql/roomQueries.graphql';
import {buildMemberResult} from '@/testHelpers/testData';
import {buildItemResponse} from '@/testHelpers/itemQueryStubs';
import {Item, Room} from '@type-definitions/graphql';

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

export function makeHappyRoomMemberUpdateSubscription() {
  return {
    query: roomMemberUpdates,
    successData: {
      roomMemberUpdates: {
        id: '123',
        members: [
          buildMemberResult({id: '1', name: 'me'}),
          buildMemberResult({id: '2', name: 'my-mother'}),
        ],
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
