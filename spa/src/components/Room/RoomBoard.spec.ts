import { fireEvent, renderWithApollo, screen } from '@/testHelpers/renderer';
import RoomBoard from '@/components/Room/RoomBoard.vue';
import {
  PointerDownEvent,
  PointerMoveEvent,
  PointerUpEvent,
} from '@/testHelpers/jsdomFriendlyPointerEvents';
import { UPDATE_ROOM_BOARD_ITEM_MUTATION } from '@/components/Room/roomGraphQLQuery';

describe('<room-board />', () => {
  it('renders a item defaulting at 10px by 10px', () => {
    renderWithApollo(RoomBoard, [], {
      propsData: {
        roomId: 'ROOM123',
        items: [{ id: 'ITEM123', posX: 10, posY: 10 }],
      },
    });

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  10px;
      left: 10px;
    `);
  });

  describe('when moving', () => {
    const successData = {
      updateRoomBoardItems: {
        id: '123',
        items: [],
      },
    };

    it('assigns the data-moving property item (vue-jest / jsdom do not support style tags)', async () => {
      const stubQuerySpec = {
        query: UPDATE_ROOM_BOARD_ITEM_MUTATION,
        successData,
      };

      renderWithApollo(RoomBoard, stubQuerySpec, {
        propsData: {
          roomId: 'ROOM123',
          items: [{ id: 'ITEM123', posX: 10, posY: 10 }],
        },
      });

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerDownEvent({
          pointerId: 1000,
        })
      );

      expect(screen.getByRole('listitem')).toHaveAttribute('data-moving');
    });

    it('sends a mutation', async () => {
      const expectedMutationVars = {
        input: {
          id: 'ROOM123',
          items: [
            {
              id: 'ITEM123',
              posX: 30,
              posY: 20,
              moving: true,
            },
          ],
        },
      };

      const stubQuerySpec = {
        query: UPDATE_ROOM_BOARD_ITEM_MUTATION,
        variables: expectedMutationVars,
        successData,
      };

      const { queryMocks } = renderWithApollo(RoomBoard, stubQuerySpec, {
        propsData: {
          roomId: 'ROOM123',
          items: [{ id: 'ITEM123', posX: 10, posY: 10 }],
        },
      });

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerDownEvent({
          pointerId: 1000,
        })
      );

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerMoveEvent({
          movementX: 20,
          movementY: 10,
          pointerId: 1000,
        })
      );

      expect(queryMocks[0]).toHaveBeenCalledWith(expectedMutationVars);
    });
  });
  describe('after moving', () => {
    const successData = {
      updateRoomBoardItems: {
        id: '123',
        items: [],
      },
    };

    it('the item no longer has the data-moving attribute (vue-jest / jsdom do not support style tags)', async () => {
      const stubQuerySpec = {
        query: UPDATE_ROOM_BOARD_ITEM_MUTATION,
        successData,
      };

      renderWithApollo(RoomBoard, stubQuerySpec, {
        propsData: {
          roomId: 'ROOM123',
          items: [{ id: 'ITEM123', posX: 10, posY: 10 }],
        },
      });

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerDownEvent({
          pointerId: 1000,
        })
      );

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerUpEvent({
          pointerId: 1000,
        })
      );

      expect(screen.getByRole('listitem')).not.toHaveAttribute('data-moving');
    });
  });
});
