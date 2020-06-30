import {
  render,
  renderWithApollo,
  screen,
  waitFor,
} from '@/testHelpers/renderer';
import userEvent from '@testing-library/user-event';
import Lobby from './Lobby.vue';
import { joinRoom } from '@/graphql/roomQueries.graphql';
import { sleep } from '@/testHelpers/timeout';
const ROOM_NAME = 'my-room';
const MEMBER_NAME = 'me';

function makeHappyJoinRoomMutationStub() {
  const successData = {
    joinRoom: {
      id: ROOM_NAME,
      members: [MEMBER_NAME],
      items: [],
    },
  };
  return {
    query: joinRoom,
    variables: {
      input: {
        roomName: ROOM_NAME,
        memberName: MEMBER_NAME,
      },
    },
    successData,
  };
}

function makeSadJoinRoomMutationStub() {
  const errorData = {
    message: 'everything is broken',
  };
  return {
    query: joinRoom,
    variables: {
      input: {
        roomName: ROOM_NAME,
        memberName: MEMBER_NAME,
      },
    },
    errorData,
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

  it('auto fills the room name if provided', async () => {
    render(Lobby, { propsData: { roomId: '11111' } });

    expect(screen.getByRole('textbox', { name: /Room name/i })).toHaveValue(
      '11111'
    );
  });

  it('joins the room and emits a joined event', async () => {
    const { queryMocks, emitted } = renderWithApollo(Lobby, [
      makeHappyJoinRoomMutationStub(),
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

  it('displays an error message when joining fails unexpectedly', async () => {
    const $toasted = {
      global: {
        apollo_error: jest.fn(),
      },
    };

    const { emitted } = renderWithApollo(
      Lobby,
      [makeSadJoinRoomMutationStub()],
      {
        mocks: {
          $toasted: $toasted,
        },
      }
    );

    await userEvent.type(screen.getByLabelText('Your name'), MEMBER_NAME);
    await userEvent.type(screen.getByLabelText('Room name'), ROOM_NAME);
    await userEvent.click(screen.getByRole('button', { name: /join room/i }));

    await sleep(5);
    expect(emitted().joined).toBeUndefined();
    expect($toasted.global.apollo_error).toHaveBeenCalledWith(
      'Was not able to join the room: GraphQL error: everything is broken'
    );
  });
});
