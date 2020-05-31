import { fireEvent, renderWithApollo, screen } from '@/testHelpers/renderer';
import RoomBoard from '@/components/Room/RoomBoard.vue';
import {
  PointerDownEvent,
  PointerMoveEvent,
  PointerUpEvent,
} from '@/testHelpers/jsdomFriendlyPointerEvents';
import { UPDATE_ROOM_BOARD_ITEM_MUTATION } from '@/components/Room/roomGraphQLQuery';

function makeHappyPathMutationStub() {
  const successData = {
    updateRoomBoardItems: {
      id: '123',
      items: [],
    },
  };
  return {
    query: UPDATE_ROOM_BOARD_ITEM_MUTATION,
    variables: {
      input: {
        id: 'ROOM123',
        items: [
          {
            id: 'ITEM123',
            posX: 30,
            posY: 20,
            lockedBy: 'me',
          },
        ],
      },
    },
    successData,
  };
}

describe('<room-board />', () => {
  it('renders a item defaulting at 10px by 10px', () => {
    renderWithApollo(RoomBoard, [makeHappyPathMutationStub()], {
      propsData: {
        myId: 'me',
        roomId: 'ROOM123',
        items: [{ id: 'ITEM123', posX: 10, posY: 10 }],
      },
    });

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  10px;
      left: 10px;
    `);
  });

  describe('when locked', () => {
    it('allows moving a locked item if i locked it', async () => {
      renderWithApollo(RoomBoard, [makeHappyPathMutationStub()], {
        propsData: {
          myId: 'me',
          roomId: 'ROOM123',
          items: [{ id: 'ITEM123', posX: 10, posY: 10, lockedBy: 'me' }],
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

      expect(screen.getByRole('listitem')).toHaveStyle(`
        top:  20px;
        left: 30px;
      `);
    });
    it('does not register the interaction if it has been locked by somebody else', async () => {
      renderWithApollo(RoomBoard, [], {
        propsData: {
          myId: 'me',
          roomId: 'ROOM123',
          items: [
            { id: 'ITEM123', posX: 10, posY: 10, lockedBy: 'other-person' },
          ],
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

      expect(screen.getByRole('listitem')).toHaveStyle(`
        top:  10px;
        left: 10px;
      `);
    });
  });
  describe('when moving', () => {
    it('assigns the data-moving property item (vue-jest / jsdom do not support style tags)', async () => {
      renderWithApollo(RoomBoard, [makeHappyPathMutationStub()], {
        propsData: {
          myId: 'me',
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

    it('updates the position', async () => {
      renderWithApollo(RoomBoard, [makeHappyPathMutationStub()], {
        propsData: {
          myId: 'me',
          roomId: 'ROOM123',
          items: [{ id: 'ITEM123', posX: 10, posY: 10 }],
        },
      });

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerMoveEvent({
          movementX: 20,
          movementY: 10,
        })
      );

      expect(screen.getByRole('listitem')).toHaveStyle(`
        top:  20px;
        left: 30px;
      `);
    });

    it('sends a mutation', async () => {
      const { queryMocks } = renderWithApollo(
        RoomBoard,
        [makeHappyPathMutationStub()],
        {
          propsData: {
            myId: 'me',
            roomId: 'ROOM123',
            items: [{ id: 'ITEM123', posX: 10, posY: 10 }],
          },
        }
      );

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerMoveEvent({
          movementX: 20,
          movementY: 10,
        })
      );

      const expectedMutationVars = {
        input: {
          id: 'ROOM123',
          items: [
            {
              id: 'ITEM123',
              posX: 30,
              posY: 20,
              lockedBy: 'me',
            },
          ],
        },
      };

      expect(await queryMocks[0]).toHaveBeenCalledWith(expectedMutationVars);

      expect(screen.getByRole('listitem')).toHaveStyle(`
        top:  20px;
        left: 30px;
      `);
    });
  });
  describe('after moving', () => {
    it('the item no longer has the data-moving attribute (vue-jest / jsdom do not support style tags)', async () => {
      renderWithApollo(RoomBoard, makeHappyPathMutationStub(), {
        propsData: {
          myId: 'me',
          roomId: 'ROOM123',
          items: [{ id: 'ITEM123', posX: 10, posY: 10 }],
        },
      });

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());

      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());

      expect(screen.getByRole('listitem')).not.toHaveAttribute('data-moving');
    });
  });
  describe('when props change', () => {
    it('updates based upon the new props', async () => {
      const {updateProps} = renderWithApollo(RoomBoard, makeHappyPathMutationStub(), {
        propsData: {
          myId: 'me',
          roomId: 'ROOM123',
          items: [{ id: 'ITEM123', posX: 10, posY: 10 }],
        },
      });

      expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  10px;
      left: 10px;
    `);

      await updateProps({
        myId: 'me',
        roomId: 'ROOM123',
        items: [{ id: 'ITEM123', posX: 20, posY: 20 }],
      });

      expect(screen.getByRole('listitem')).toHaveStyle(`
        top:  20px;
        left: 20px;
      `);
    })
  });
});
