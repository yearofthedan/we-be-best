import userEvent from '@testing-library/user-event';
import Lobby from '@/components/Lobby/Lobby.vue';
import { screen, renderWithApollo } from '@/testHelpers/renderer';
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
  it('creates a gathering when I input a valid name and continue', async () => {
    const { queryMocks } = renderWithApollo(
      Lobby,
      [makeHappyPathMutationStub()],
      {
        stubs: {
          Room: {
            props: ['room-id'],
            template: '<div>{{roomId}}</div>',
          },
        },
      }
    );

    await userEvent.type(screen.getByLabelText('Your name'), MEMBER_NAME);
    await userEvent.type(screen.getByLabelText('Room name'), ROOM_NAME);
    await userEvent.click(screen.getByRole('button'));
    expect(queryMocks[0]).toHaveBeenCalledWith({
      input: {
        roomName: ROOM_NAME,
        memberName: MEMBER_NAME,
      },
    });

    expect(await screen.findByText(`${ROOM_NAME}`)).toBeInTheDocument();
  });
});
