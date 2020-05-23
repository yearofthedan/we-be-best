import { fireEvent, renderWithApollo, screen } from '@/testHelpers/renderer';
import SharedBoard from '@/components/Room/SharedBoard.vue';
import { MouseMoveEvent } from '@/testHelpers/jsdomFriendlyMouseEvents';
import { UPDATE_ROOM_NOTES_MUTATION } from '@/components/Room/roomGraphQLQuery';

describe('<shared-board />', () => {
  it('renders a note defaulting at 10px by 10px and lets me move it around', () => {
    const stubQuery = {
      query: UPDATE_ROOM_NOTES_MUTATION,
      successData: {},
    };

    renderWithApollo(SharedBoard, stubQuery, {
      propsData: { roomId: 'ROOM123', notes: [{ id: 'NOTE123', posX: 10, posY: 10, moving: false }] },
    });

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  10px;
      left: 10px;
    `);
  });

  it('sends a mutation when a note changes position', async () => {
    const expectedMutationVars = {
      input: {
        id: 'ROOM123',
        notes: [
          {
            id: 'NOTE123',
            posX: 10,
            posY: 10,
            moving: true,
          },
        ],
      },
    }
    const stubQuerySpec = {
      query: UPDATE_ROOM_NOTES_MUTATION,
      variables: expectedMutationVars,
      successData: {
        updateRoomNotes: {
          id: '123',
        },
      },
    };

    const { queryMocks } = renderWithApollo(SharedBoard, stubQuerySpec, {
      propsData: { roomId: 'ROOM123', notes: [{ id: 'NOTE123', posX: 10, posY: 10, moving: false }] },
    });

    await fireEvent.mouseDown(screen.getByRole('listitem'));
    await fireEvent(
      screen.getByRole('listitem'),
      new MouseMoveEvent({
        movementX: 20,
        movementY: 10,
      })
    );

    expect(queryMocks[0]).toHaveBeenCalledWith(expectedMutationVars);
  });
});
