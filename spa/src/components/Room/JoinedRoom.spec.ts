import JoinedRoom from '@/components/Room/JoinedRoom.vue';
import {
  GET_ROOM_QUERY,
  ROOM_UPDATES_SUBSCRIPTION,
} from '@/components/Room/roomGraphQLQuery';
import { renderWithApollo, screen } from '@/testHelpers/renderer';

describe('<joined-room />', () => {
  it('queries and subscribes to the room details', async () => {
    const stubQuery = {
      query: GET_ROOM_QUERY,
      successData: {
        room: {
          id: '123',
          members: ['my-name'],
          notes: [],
        },
      },
    };

    const stubSubscription = {
      query: ROOM_UPDATES_SUBSCRIPTION,
      successData: {
        roomUpdates: {
          id: '123',
          members: ['my-name2'],
          notes: [],
        },
      },
    };

    renderWithApollo(JoinedRoom, [stubQuery, stubSubscription], {
      propsData: { roomId: '123' },
    });

    expect(await screen.findByText('my-name2')).toBeInTheDocument();
  });
});
