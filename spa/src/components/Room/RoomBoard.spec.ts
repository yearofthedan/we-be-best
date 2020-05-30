import { fireEvent, renderWithApollo, screen } from '@/testHelpers/renderer';
import RoomBoard from '@/components/Room/RoomBoard.vue';
import { PointerMoveEvent } from '@/testHelpers/jsdomFriendlyPointerEvents';
import { UPDATE_ROOM_BOARD_ITEM_MUTATION } from '@/components/Room/roomGraphQLQuery';

describe('<room-board />', () => {
  it('renders a item defaulting at 10px by 10px and lets me move it around', () => {
    const stubQuery = {
      query: UPDATE_ROOM_BOARD_ITEM_MUTATION,
      successData: {},
    };

    renderWithApollo(RoomBoard, stubQuery, {
      propsData: {
        roomId: 'ROOM123',
        items: [{ id: 'ITEM123', posX: 10, posY: 10, moving: false }],
      },
    });

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  10px;
      left: 10px;
    `);
  });

  it('sends a mutation when a item changes position', async () => {
    const expectedMutationVars = {
      input: {
        id: 'ROOM123',
        items: [
          {
            id: 'ITEM123',
            posX: 10,
            posY: 10,
            moving: true,
          },
        ],
      },
    };
    const stubQuerySpec = {
      query: UPDATE_ROOM_BOARD_ITEM_MUTATION,
      variables: expectedMutationVars,
      successData: {
        updateRoomBoardItems: {
          id: '123',
          items: [],
        },
      },
    };

    const { queryMocks } = renderWithApollo(RoomBoard, stubQuerySpec, {
      propsData: {
        roomId: 'ROOM123',
        items: [{ id: 'ITEM123', posX: 10, posY: 10, moving: false }],
      },
    });

    await fireEvent.pointerDown(screen.getByRole('listitem'));
    await fireEvent(
      screen.getByRole('listitem'),
      new PointerMoveEvent({
        movementX: 20,
        movementY: 10,
      })
    );

    expect(queryMocks[0]).toHaveBeenCalledWith(expectedMutationVars);
  });
});
