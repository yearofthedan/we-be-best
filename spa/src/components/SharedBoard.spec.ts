import {fireEvent, renderWithApollo, screen} from '@/testHelpers/renderer';
import SharedBoard from '@/components/SharedBoard.vue';
import {MouseMoveEvent} from '@/testHelpers/jsdomFriendlyMouseEvents';
import {ROOM_CHANGED_MUTATION} from '@/components/roomGraphQLQuery';

describe('<shared-board />', () => {
  it('renders a note defaulting at 10px by 10px and lets me move it around', () => {
    const stubQuery = {
      query: ROOM_CHANGED_MUTATION,
      successData: {}
    };

    renderWithApollo(SharedBoard, stubQuery);

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  10px;
      left: 10px;
    `);
  });

  it('updates the position of the note when I move it around', async () => {
    const stubQuery = {
      query: ROOM_CHANGED_MUTATION,
      successData: {
        roomChanged: {
          id: '123'
        }
      }
    };

    renderWithApollo(SharedBoard, stubQuery);

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
    const stubQuerySpec = {
      query: ROOM_CHANGED_MUTATION,
      variables: {
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
      },
      successData: {
        roomChanged: {
          id: '123'
        }
      }
    };

    const {queryMock} = renderWithApollo(SharedBoard, stubQuerySpec,
      {
        propsData: { roomId: 'ROOM123' },
      });

    await fireEvent.mouseDown(screen.getByRole('listitem'));

    expect(queryMock).toHaveBeenCalled();
  })
});
