import { renderWithApollo, screen } from '@/testHelpers/renderer';
import userEvent from '@testing-library/user-event';
import App from './App.vue';
import { joinRoom } from '@/graphql/roomQueries.graphql';

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

describe('App', () => {
  it('creates a gathering when I input a valid name and continue', async () => {
    const { queryMocks } = renderWithApollo(
      App,
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
