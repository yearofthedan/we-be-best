import Room from '@/components/Room/Room.vue';
import {
  GET_ROOM_QUERY,
  ROOM_ITEM_UPDATES_SUBSCRIPTION,
  ROOM_MEMBER_UPDATES_SUBSCRIPTION,
  ROOM_UPDATES_SUBSCRIPTION,
} from '@/components/Room/roomGraphQLQuery';
import { renderWithApollo, screen } from '@/testHelpers/renderer';
import { makeItem, makeRoomMember } from '@/testHelpers/testData';

describe('<room />', () => {
  it('queries and subscribes to the room details', async () => {
    const stubQuery = {
      query: GET_ROOM_QUERY,
      successData: {
        room: {
          id: '123',
          members: [makeRoomMember('my-name')],
          items: [makeItem({ id: 'ITEM123' })],
        },
      },
    };

    const stubRoomUpdateSubscription = {
      query: ROOM_UPDATES_SUBSCRIPTION,
      successData: {
        roomUpdates: {
          id: '123',
          members: [makeRoomMember('my-name')],
          items: [makeItem({ id: 'ITEM123' })],
        },
      },
    };

    const stubRoomMemberUpdateSubscription = {
      query: ROOM_MEMBER_UPDATES_SUBSCRIPTION,
      successData: {
        roomMemberUpdates: {
          id: '123',
          members: [makeRoomMember('my-name'), makeRoomMember('my-name2')],
        },
      },
    };

    const stubRoomItemUpdatesSubscription = {
      query: ROOM_ITEM_UPDATES_SUBSCRIPTION,
      successData: {
        itemUpdates: makeItem({ id: '123' }),
      },
    };

    renderWithApollo(
      Room,
      [
        stubQuery,
        stubRoomUpdateSubscription,
        stubRoomMemberUpdateSubscription,
        stubRoomItemUpdatesSubscription,
      ],
      {
        propsData: { roomId: '123', myId: 'me' },
      }
    );

    expect(await screen.findByText('my-name')).toBeInTheDocument();
    expect(screen.getByText('my-name2')).toBeInTheDocument();
    expect(screen.getAllByText('placeholder text')).toHaveLength(2);
  });
});
