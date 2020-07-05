import { renderWithApollo, screen } from '@/testHelpers/renderer';
import userEvent from '@testing-library/user-event';
import Home from './Home.vue';
import { joinRoom } from '@/graphql/roomQueries.graphql';

function makeHappyPathMutationStub() {
  const successData = {
    joinRoom: {
      id: 'my-room',
      members: ['me'],
      items: [],
    },
  };
  return {
    query: joinRoom,
    variables: {
      input: {
        roomId: 'my-room',
        memberName: 'me',
      },
    },
    successData,
  };
}

describe('Home', () => {
  it('creates a gathering when I input a valid name and continue', async () => {
    const { queryMocks } = renderWithApollo(
      Home,
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

    await userEvent.type(screen.getByLabelText('Your name'), 'me');
    const idField = screen.getByLabelText('Room id');
    await userEvent.clear(idField);
    await userEvent.type(idField, 'my-room');
    await userEvent.click(screen.getByRole('button'));
    expect(queryMocks[0]).toHaveBeenCalledWith({
      input: {
        roomId: 'my-room',
        memberName: 'me',
      },
    });

    expect(await screen.findByText('my-room')).toBeInTheDocument();
  });
});
