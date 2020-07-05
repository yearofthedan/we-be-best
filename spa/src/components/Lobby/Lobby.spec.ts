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
const ROOM_ID = 'my-room';
const MEMBER_NAME = 'me';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('stub-uuid'),
}));

function makeHappyJoinRoomMutationStub() {
  const successData = {
    joinRoom: {
      id: ROOM_ID,
      members: [MEMBER_NAME],
      items: [],
    },
  };
  return {
    query: joinRoom,
    variables: {
      input: {
        roomId: ROOM_ID,
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
        roomId: ROOM_ID,
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

  it('shows an error message when I try to submit without a room id', async () => {
    render(Lobby);

    await userEvent.type(screen.getByLabelText('Your name'), 'Me');
    await userEvent.type(
      screen.getByRole('textbox', { name: /Room id/i }),
      '{backspace}',
      { initialSelectionStart: 0, initialSelectionEnd: 100 }
    );
    await userEvent.click(screen.getByRole('button', { name: /join room/i }));

    expect(screen.getByText('you need a room!')).toBeInTheDocument();
  });

  it('auto fills the room id if provided', async () => {
    render(Lobby, { propsData: { existingRoomId: '11111' } });

    expect(screen.getByRole('textbox', { name: /Room id/i })).toHaveValue(
      '11111'
    );
  });

  it('generates a room id if not provided', async () => {
    render(Lobby);

    expect(screen.getByRole('textbox', { name: /Room id/i })).toHaveValue(
      'stub-uuid'
    );
  });

  it('joins the room and emits a joined event', async () => {
    const { queryMocks, emitted } = renderWithApollo(Lobby, [
      makeHappyJoinRoomMutationStub(),
    ]);

    await userEvent.type(screen.getByLabelText('Your name'), MEMBER_NAME);
    await userEvent.type(
      screen.getByRole('textbox', { name: /Room id/i }),
      ROOM_ID,
      { initialSelectionStart: 0, initialSelectionEnd: 100 }
    );
    await userEvent.click(screen.getByRole('button', { name: /join room/i }));

    expect(queryMocks[0]).toHaveBeenCalledWith({
      input: {
        roomId: ROOM_ID,
        memberName: MEMBER_NAME,
      },
    });

    await waitFor(() => {
      return expect(emitted().joined).toBeTruthy();
    });

    expect(emitted().joined[0]).toEqual([
      {
        roomId: ROOM_ID,
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
    await userEvent.type(screen.getByLabelText('Room id'), ROOM_ID);
    await userEvent.click(screen.getByRole('button', { name: /join room/i }));

    await sleep(5);
    expect(emitted().joined).toBeUndefined();
    expect($toasted.global.apollo_error).toHaveBeenCalledWith(
      'Was not able to join the room: GraphQL error: everything is broken'
    );
  });
});
