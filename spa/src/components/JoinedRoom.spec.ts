import JoinedRoom from '@/components/JoinedRoom.vue';
import {GET_ROOM_QUERY} from '@/components/roomGraphQLQuery';
import {renderWithApollo, screen} from '@/testHelpers/renderer';

describe('<joined-room />', () => {
  it('queries the room details', async () => {
    const stubQuery = {
      query: GET_ROOM_QUERY,
      successData: {
        room: {
          id: '123',
          members: ['my-name'],
          notes: []
        },
      }
    };

    renderWithApollo(
      JoinedRoom,
      stubQuery,
      { propsData: { roomId: '1' } }
    );

    expect(await screen.findByText('my-name')).toBeInTheDocument();
  });
});
