import Room from '@/components/Room/Room.vue';
import {
  GET_ROOM_QUERY,
  ROOM_UPDATES_SUBSCRIPTION,
} from '@/components/Room/roomGraphQLQuery';
import { renderWithApollo, screen } from '@/testHelpers/renderer';

describe('<room />', () => {
  it('queries and subscribes to the room details', async () => {
    const stubQuery = {
      query: GET_ROOM_QUERY,
      successData: {
        room: {
          id: '123',
          members: ['my-name'],
          items: [],
        },
      },
    };

    const stubSubscription = {
      query: ROOM_UPDATES_SUBSCRIPTION,
      successData: {
        roomUpdates: {
          id: '123',
          members: ['my-name2'],
          items: [],
        },
      },
    };

    const { queryMocks } = renderWithApollo(
      Room,
      [stubQuery, stubSubscription],
      {
        propsData: { roomId: '123', myId: 'me' },
      }
    );

    await Promise.all(queryMocks);
    expect(queryMocks[0]).toHaveBeenCalled();
    expect(await screen.findByText('my-name2')).toBeInTheDocument();
  });
});
