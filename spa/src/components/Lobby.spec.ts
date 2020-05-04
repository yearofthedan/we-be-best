import {render} from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import Lobby from "@/components/Lobby.vue";
import { createMockClient } from 'mock-apollo-client';
import {GET_ROOM_QUERY} from '@/components/RoomQueries';
import VueApollo from 'vue-apollo'

describe("<Lobby />", () => {
  it("creates a gathering when I input a valid name and continue", async () => {
    const mockApolloClient = createMockClient();
    mockApolloClient.setRequestHandler(
      GET_ROOM_QUERY,
      () => Promise.resolve({ data: { room: {} } })
    );
    const apolloProvider = new VueApollo({
      defaultClient: mockApolloClient,
    });

    const { getByLabelText, getByText, findByText } = render(Lobby, {
      apolloProvider
    },
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      vue => vue.use(VueApollo),
    );

    await userEvent.type(getByLabelText('Your name'), 'yulu');

    userEvent.click(getByText('New gathering'));

    await expect(await findByText('Room for placeholder-id')).toBeInTheDocument();
  });
});
