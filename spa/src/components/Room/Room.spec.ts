import Room from '@/components/Room/Room.vue';
import { renderWithApollo, screen } from '@/testHelpers/renderer';
import { makeItem, buildMemberResult } from '@/testHelpers/testData';
import {
  itemUpdates,
  room,
  roomMemberUpdates,
} from '@/graphql/roomQueries.graphql';

describe('<room />', () => {
  it('queries and subscribes to the room details', async () => {
    const stubQuery = {
      query: room,
      successData: {
        room: {
          id: '123',
          members: [buildMemberResult({ name: 'me' })],
          items: [makeItem({ id: 'ITEM123' })],
        },
      },
    };

    const stubRoomMemberUpdateSubscription = {
      query: roomMemberUpdates,
      successData: {
        roomMemberUpdates: {
          id: '123',
          members: [
            buildMemberResult({ id: '1', name: 'me' }),
            buildMemberResult({ id: '2', name: 'my-mother' }),
          ],
        },
      },
    };

    const stubRoomItemUpdatesSubscription = {
      query: itemUpdates,
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
