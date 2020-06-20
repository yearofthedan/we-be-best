import Room from '@/components/Room/Room.vue';
import {
  GET_ROOM_QUERY,
  ROOM_ITEM_UPDATES_SUBSCRIPTION,
  ROOM_MEMBER_UPDATES_SUBSCRIPTION,
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
          members: [makeRoomMember('me')],
          items: [makeItem({ id: 'ITEM123' })],
        },
      },
    };

    const stubRoomMemberUpdateSubscription = {
      query: ROOM_MEMBER_UPDATES_SUBSCRIPTION,
      successData: {
        roomMemberUpdates: {
          id: '123',
          members: [makeRoomMember('me'), makeRoomMember('my-mother')],
        },
      },
    };

    const stubRoomItemUpdatesSubscription = {
      query: ROOM_ITEM_UPDATES_SUBSCRIPTION,
      successData: {
        itemUpdates: makeItem({ id: 'ITEMM1234' }),
      },
    };

    renderWithApollo(
      Room,
      [
        stubQuery,
        stubRoomMemberUpdateSubscription,
        stubRoomItemUpdatesSubscription,
      ],
      {
        propsData: { roomId: '123', myId: 'me' },
      }
    );

    expect(await screen.findByText(/me/)).toBeInTheDocument();
    expect(screen.getByText(/my-mother/)).toBeInTheDocument();
    expect(await screen.findAllByText('placeholder text')).toHaveLength(2);
  });
});
