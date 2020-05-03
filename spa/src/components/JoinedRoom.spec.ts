import {render} from '@testing-library/vue';
import JoinedRoom from '@/components/JoinedRoom.vue';
import {createMockClient} from 'mock-apollo-client';
import {ROOM_QUERY} from '@/components/RoomQueries';
import VueApollo from 'vue-apollo';

describe('<joined-room />', () => {
  it('queries the room details', async () => {
    const mockApolloClient = createMockClient();
    mockApolloClient.setRequestHandler(
      ROOM_QUERY,
      () => Promise.resolve({ data: { room: {
            members: ['my-name']
          } } })
    );
    const apolloProvider = new VueApollo({
      defaultClient: mockApolloClient,
    });

    const { findByText } = render(JoinedRoom, {
      propsData: {
        roomId: '1'
      },
        apolloProvider
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      vue => vue.use(VueApollo),
    );

    expect(await findByText('my-name')).toBeInTheDocument();
  });
});
