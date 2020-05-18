import userEvent from '@testing-library/user-event';
import Lobby from '@/components/Lobby.vue';
import { GET_ROOM_QUERY } from '@/components/roomGraphQLQuery';
import { renderWithApollo, screen } from '@/testHelpers/renderer';

describe('<lobby />', () => {
  it('creates a gathering when I input a valid name and continue', async () => {
    const stubQuery = {
      query: GET_ROOM_QUERY,
      successData: {
        room: {
          id: 'ROOM123',
          members: []
        },
      }};

    renderWithApollo(Lobby, stubQuery);

    await userEvent.type(screen.getByLabelText('Your name'), 'yulu');
    userEvent.click(screen.getByText('New gathering'));

    await expect(
      await screen.findByText('Room for placeholder-id')
    ).toBeInTheDocument();
  });
});
