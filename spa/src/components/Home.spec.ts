import { renderWithApollo, screen } from '@/testHelpers/renderer';
import userEvent from '@testing-library/user-event';
import Home from './Home.vue';
import { makeHappyAddMemberMutationStub } from '@/testHelpers/roomQueryStubs';

jest.mock('nanoid', () => ({
  customAlphabet: () => jest.fn().mockReturnValue('stub-roomid'),
}));

describe('Home', () => {
  it('creates a gathering when I input a valid name and continue', async () => {
    const { queryMocks } = renderWithApollo(
      Home,
      [makeHappyAddMemberMutationStub()],
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
    await userEvent.click(screen.getByRole('button', { name: /create room/i }));
    expect(queryMocks[0]).toHaveBeenCalledWith({
      input: {
        roomId: 'stub-roomid',
        memberName: 'me',
      },
    });

    expect(await screen.findByText('stub-roomid')).toBeInTheDocument();
  });
});
