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
import { ACTION_STATE } from '@/components/atoms/buttonStates';
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
  describe('joining a room', () => {
    it('defaults to the join room state when I have provided an id', () => {
      render(Lobby, { propsData: { existingRoomId: '11111' } });

      expect(
        screen.getByRole('button', { name: /Join room/i })
      ).toBeInTheDocument();
    });

    it('auto fills the room id when provided', async () => {
      render(Lobby, { propsData: { existingRoomId: '11111' } });

      expect(screen.getByRole('textbox', { name: /Room id/i })).toHaveValue(
        '11111'
      );
    });

    it('lets me switch from joining to creating', async () => {
      render(Lobby, { propsData: { existingRoomId: '11111' } });

      userEvent.click(screen.getByRole('button', { name: /Create a room/i }));

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /Create room/i })
        ).toBeInTheDocument()
      );
    });

    it('clears the id when switching to join from creating', async () => {
      render(Lobby);

      expect(screen.getByText('stub-uuid')).toBeInTheDocument();
      userEvent.click(screen.getByRole('button', { name: /Join a room/i }));

      await waitFor(() =>
        expect(screen.queryByText('stub-uuid')).not.toBeInTheDocument()
      );
    });

    it('shows an error message when I try to join without a room id', async () => {
      render(Lobby, {
        propsData: {
          existingRoomId: '1234',
        },
      });

      await userEvent.type(screen.getByLabelText('Your name'), 'Me');
      await userEvent.type(
        screen.getByRole('textbox', { name: /Room id/i }),
        '{backspace}',
        { initialSelectionStart: 0, initialSelectionEnd: 100 }
      );
      await userEvent.click(screen.getByRole('button', { name: /join room/i }));

      expect(screen.getByText('you need a room!')).toBeInTheDocument();
    });

    it('joins a room and emits a joined event', async () => {
      const { queryMocks, emitted } = renderWithApollo(
        Lobby,
        [makeHappyJoinRoomMutationStub()],
        {
          propsData: {
            existingRoomId: '1234',
          },
        }
      );

      await userEvent.type(
        screen.getByRole('textbox', { name: /Room id/i }),
        ROOM_ID,
        { initialSelectionStart: 0, initialSelectionEnd: 100 }
      );
      await userEvent.type(screen.getByLabelText('Your name'), MEMBER_NAME);
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
  });

  describe('creating a room', () => {
    it('defaults to creating a room when I have not provided an id', () => {
      render(Lobby);

      expect(
        screen.getByRole('button', { name: /Create room/i })
      ).toBeInTheDocument();
    });

    it('lets me switch from creating to joining', async () => {
      render(Lobby);

      userEvent.click(screen.getByRole('button', { name: /Join a room/i }));

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /Join room/i })
        ).toBeInTheDocument()
      );
    });

    it('generates an id when switching to creating', async () => {
      render(Lobby, { propsData: { existingRoomId: '11111' } });

      expect(screen.queryByText('stub-uuid')).not.toBeInTheDocument();
      userEvent.click(screen.getByRole('button', { name: /Create a room/i }));

      await waitFor(() =>
        expect(screen.getByText('stub-uuid')).toBeInTheDocument()
      );
    });

    it('creates a room and emits a joined event', async () => {
      const { queryMocks, emitted } = renderWithApollo(Lobby, [
        makeHappyJoinRoomMutationStub(),
      ]);

      await userEvent.type(screen.getByLabelText('Your name'), MEMBER_NAME);
      await userEvent.click(
        screen.getByRole('button', { name: /create room/i })
      );

      expect(queryMocks[0]).toHaveBeenCalledWith({
        input: {
          roomId: 'stub-uuid',
          memberName: MEMBER_NAME,
        },
      });

      await waitFor(() => {
        return expect(emitted().joined).toBeTruthy();
      });

      expect(emitted().joined[0]).toEqual([
        {
          roomId: 'stub-uuid',
          memberName: MEMBER_NAME,
        },
      ]);
    });
  });

  it('shows an error message when I try to submit without a name', async () => {
    render(Lobby);

    await userEvent.click(screen.getByRole('button', { name: /create room/i }));

    expect(await screen.findByText('you need a name!')).toBeInTheDocument();
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
    await userEvent.click(screen.getByRole('button', { name: /create room/i }));

    await sleep(5);
    expect(emitted().joined).toBeUndefined();
    expect($toasted.global.apollo_error).toHaveBeenCalledWith(
      'Was not able to join the room: GraphQL error: everything is broken'
    );
  });

  it('displays loading indicator while submitting', async () => {
    renderWithApollo(Lobby, []);

    await userEvent.type(screen.getByLabelText('Your name'), MEMBER_NAME);
    await userEvent.click(screen.getByRole('button', { name: /create room/i }));

    expect(
      screen.getByRole('button', { name: /create room/i })
    ).toHaveAttribute('data-action-state', ACTION_STATE.LOADING);
  });

  it('displays success indicator after submitting', async () => {
    renderWithApollo(Lobby, [makeHappyJoinRoomMutationStub()]);

    await userEvent.type(screen.getByLabelText('Your name'), MEMBER_NAME);
    await userEvent.click(screen.getByRole('button', { name: /create room/i }));

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /create room/i })
      ).toHaveAttribute('data-action-state', ACTION_STATE.SUCCESS)
    );
  });
});
