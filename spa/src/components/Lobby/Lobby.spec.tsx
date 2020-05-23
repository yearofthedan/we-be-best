import userEvent from '@testing-library/user-event';
import Lobby from '@/components/Lobby/Lobby.vue';
import { screen, render } from '@/testHelpers/renderer';

describe('<lobby />', () => {
  it('creates a gathering when I input a valid name and continue', async () => {
    render(Lobby, {
      stubs: {
        JoinedRoom: {
          props: ['room-id'],
          template: '<div>Room for {{roomId}}</div>',
        },
      },
    });

    await userEvent.type(screen.getByLabelText('Your name'), 'yulu');
    userEvent.click(screen.getByText('New gathering'));

    await expect(
      await screen.findByText('Room for placeholder-id')
    ).toBeInTheDocument();
  });
});
