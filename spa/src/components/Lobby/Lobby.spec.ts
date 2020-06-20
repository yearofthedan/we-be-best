import {
  render,
  renderWithApollo,
  screen,
  waitFor,
} from '@/testHelpers/renderer';
import userEvent from '@testing-library/user-event';
import Lobby from './Lobby.vue';
import { JOIN_ROOM_MUTATION } from '@/components/Room/roomGraphQLQuery';

const ROOM_NAME = 'my-room';
const MEMBER_NAME = 'me';

function makeHappyPathMutationStub() {
  const successData = {
    joinRoom: {
      id: ROOM_NAME,
      members: [MEMBER_NAME],
      items: [],
    },
  };
  return {
    query: JOIN_ROOM_MUTATION,
    variables: {
      input: {
        roomName: ROOM_NAME,
        memberName: MEMBER_NAME,
      },
    },
    successData,
  };
}

describe('<lobby />', () => {
  it('shows an error message when I try to submit without a name', async () => {
    render(Lobby);

    await userEvent.click(screen.getByRole('button', { name: /join room/i }));

    expect(await screen.findByText('you need a name!')).toBeInTheDocument();
  });

  it('shows an error message when I try to submit without a room name', async () => {
    render(Lobby);

    await userEvent.click(screen.getByRole('button', { name: /join room/i }));

    expect(await screen.findByText('you need a room!')).toBeInTheDocument();
  });

  it('joins the room and emits a joined event', async () => {
    const { queryMocks, emitted } = renderWithApollo(Lobby, [
      makeHappyPathMutationStub(),
    ]);

    await userEvent.type(screen.getByLabelText('Your name'), MEMBER_NAME);
    await userEvent.type(screen.getByLabelText('Room name'), ROOM_NAME);
    await userEvent.click(screen.getByRole('button', { name: /join room/i }));

    expect(queryMocks[0]).toHaveBeenCalledWith({
      input: {
        roomName: ROOM_NAME,
        memberName: MEMBER_NAME,
      },
    });

    await waitFor(() => {
      return expect(emitted().joined).toBeTruthy();
    });

    expect(emitted().joined[0]).toEqual([
      {
        roomName: ROOM_NAME,
        memberName: MEMBER_NAME,
      },
    ]);
  });
});
