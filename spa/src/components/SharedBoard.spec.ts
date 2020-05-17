import VueApollo from 'vue-apollo';
import { when } from 'jest-when';
import { fireEvent, render, screen } from '@testing-library/vue';
import SharedBoard from '@/components/SharedBoard.vue';
import { MouseMoveEvent } from '@/testHelpers/jsdomFriendlyMouseEvents';
import {createMockClient, MockApolloClient} from 'mock-apollo-client';
import { ROOM_CHANGED_MUTATION } from '@/components/roomGraphQLQuery';

describe('<shared-board />', () => {
  let apolloProvider: VueApollo;
  let mockApolloClient: MockApolloClient;

  beforeEach(() => {
    mockApolloClient = createMockClient();
    apolloProvider = new VueApollo({
      defaultClient: mockApolloClient,
    });
  })

  it('renders a note defaulting at 10px by 10px and lets me move it around', () => {
    mockApolloClient.setRequestHandler(ROOM_CHANGED_MUTATION, jest.fn());
    render(SharedBoard, { apolloProvider });

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  10px;
      left: 10px;
    `);
  });

  it('updates the position of the note when I move it around', async () => {
    const queryHandler = jest.fn();
    mockApolloClient.setRequestHandler(ROOM_CHANGED_MUTATION, queryHandler);

    queryHandler.mockResolvedValue({
      data: {
        roomChanged: {
          id: '123'
        }
      }
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    render(SharedBoard, { apolloProvider }, vue => vue.use(VueApollo));

    await fireEvent.mouseDown(screen.getByRole('listitem'));
    await fireEvent(
      screen.getByRole('listitem'),
      new MouseMoveEvent({
        movementX: 20,
        movementY: 10,
      })
    );

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  20px;
      left: 30px;
    `);
  });

  it('sends a mutation when a note changes', async () => {
    const queryHandler = jest.fn();

    when(queryHandler)
      .calledWith({
        input: {
          id: 'ROOM123',
          notes: [
            {
              id: 'NOTE123',
              posX: 10,
              posY: 10,
              moving: true
            }
          ]
        }
      }).mockResolvedValue({
          data: {
            roomChanged: {
              id: '123'
            }
          }
      });

    mockApolloClient.setRequestHandler(ROOM_CHANGED_MUTATION, queryHandler);

    render(
      SharedBoard,
      {
        propsData: { roomId: 'ROOM123' },
        apolloProvider,
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      vue => vue.use(VueApollo)
    );
    await fireEvent.mouseDown(screen.getByRole('listitem'));

    expect(queryHandler).toHaveBeenCalled();
  })
});
