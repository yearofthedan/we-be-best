import {
  fireEvent,
  renderWithApollo,
  screen,
  waitFor,
} from '@/testHelpers/renderer';
import RoomBoard from '@/components/Room/RoomBoard.vue';
import {
  PointerDownEvent,
  PointerMoveEvent,
  PointerUpEvent,
} from '@/testHelpers/jsdomFriendlyPointerEvents';
import {
  LOCK_ROOM_BOARD_ITEM_MUTATION,
  UNLOCK_ROOM_BOARD_ITEM_MUTATION,
  UPDATE_ROOM_BOARD_ITEM_MUTATION,
} from '@/components/Room/roomGraphQLQuery';
import { Item } from '@/components/Room/RoomBoardTypes';
import { makeItem } from '@/testHelpers/testData';

const ITEM_ID = 'ITEM123';
const ROOM_ID = 'ROOM123';
const MY_ID = 'me';

function makeHappyUpdateRoomBoardItemMutationStub(items?: Item[]) {
  const successData = {
    updateRoomBoardItems: {
      id: ITEM_ID,
      items: [],
    },
  };
  return {
    query: UPDATE_ROOM_BOARD_ITEM_MUTATION,
    variables: {
      input: {
        id: ROOM_ID,
        items: items || [
          {
            id: ITEM_ID,
            lockedBy: MY_ID,
            posY: 20,
            posX: 30,
          },
        ],
      },
    },
    successData,
  };
}

function makeHappyLockRoomBoardItemMutationStub(
  overrides = {
    roomId: '123',
    itemId: 'item1',
    meId: 'me',
  }
) {
  const successData = {
    lockRoomBoardItem: {
      id: ITEM_ID,
      items: [],
    },
  };
  return {
    query: LOCK_ROOM_BOARD_ITEM_MUTATION,
    variables: {
      input: { ...overrides },
    },
    successData,
  };
}

function makeHappyUnlockRoomBoardItemMutationStub(
  overrides = {
    roomId: '123',
    itemId: 'item1',
    meId: 'me',
  }
) {
  const successData = {
    unlockRoomBoardItem: {
      id: ITEM_ID,
      items: [],
    },
  };
  return {
    query: UNLOCK_ROOM_BOARD_ITEM_MUTATION,
    variables: {
      input: { ...overrides },
    },
    successData,
  };
}

describe('<room-board />', () => {
  it('renders a item defaulting at 10px by 10px', () => {
    renderWithApollo(RoomBoard, [makeHappyUpdateRoomBoardItemMutationStub()], {
      propsData: {
        myId: MY_ID,
        roomId: ROOM_ID,
        items: [makeItem({ posX: 10, posY: 10 })],
      },
    });

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  10px;
      left: 10px;
    `);
  });

  describe('when locked', () => {
    it('allows moving a locked item if i locked it', async () => {
      renderWithApollo(
        RoomBoard,
        [
          makeHappyLockRoomBoardItemMutationStub({
            meId: MY_ID,
            itemId: ITEM_ID,
            roomId: ROOM_ID,
          }),
          makeHappyUpdateRoomBoardItemMutationStub(),
          makeHappyUnlockRoomBoardItemMutationStub({
            meId: MY_ID,
            itemId: ITEM_ID,
            roomId: ROOM_ID,
          }),
        ],
        {
          propsData: {
            myId: MY_ID,
            roomId: ROOM_ID,
            items: [makeItem({ posX: 10, posY: 10, lockedBy: MY_ID })],
          },
        }
      );

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
          myId: MY_ID,
          roomId: ROOM_ID,
          items: [
            makeItem({
              id: ITEM_ID,
              posX: 10,
              posY: 10,
              lockedBy: 'other-person',
            }),
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

  describe('when starting to move', () => {
    it('locks the item', async () => {
      const item = makeItem({ id: ITEM_ID, posX: 10, posY: 10 });
      const { queryMocks } = renderWithApollo(
        RoomBoard,
        [
          makeHappyLockRoomBoardItemMutationStub({
            meId: MY_ID,
            itemId: ITEM_ID,
            roomId: ROOM_ID,
          }),
        ],
        {
          propsData: {
            myId: MY_ID,
            roomId: ROOM_ID,
            items: [item],
          },
        }
      );

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());

      const expectedMutationVars = {
        input: { meId: MY_ID, itemId: ITEM_ID, roomId: ROOM_ID },
      };

      await waitFor(async () => {
        expect(await queryMocks[0]).toHaveBeenCalledWith(expectedMutationVars);
      });
    });
  });

  describe('when moving', () => {
    it('assigns the data-moving property item (vue-jest / jsdom do not support style tags)', async () => {
      renderWithApollo(
        RoomBoard,
        [makeHappyUpdateRoomBoardItemMutationStub()],
        {
          propsData: {
            myId: MY_ID,
            roomId: ROOM_ID,
            items: [makeItem({ id: ITEM_ID, posX: 10, posY: 10 })],
          },
        }
      );

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerDownEvent({
          pointerId: 1000,
        })
      );

      expect(screen.getByRole('listitem')).toHaveAttribute('data-moving');
    });

    it('updates the position', async () => {
      renderWithApollo(
        RoomBoard,
        [makeHappyUpdateRoomBoardItemMutationStub()],
        {
          propsData: {
            myId: MY_ID,
            roomId: ROOM_ID,
            items: [makeItem({ id: ITEM_ID, posX: 10, posY: 10 })],
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

      expect(screen.getByRole('listitem')).toHaveStyle(`
        top:  20px;
        left: 30px;
      `);
    });
  });
  describe('after moving', () => {
    it('unlocks the item', async () => {
      const { queryMocks } = renderWithApollo(
        RoomBoard,
        [
          makeHappyLockRoomBoardItemMutationStub({
            meId: MY_ID,
            itemId: ITEM_ID,
            roomId: ROOM_ID,
          }),
          makeHappyUnlockRoomBoardItemMutationStub({
            meId: MY_ID,
            itemId: ITEM_ID,
            roomId: ROOM_ID,
          }),
        ],
        {
          propsData: {
            myId: MY_ID,
            roomId: ROOM_ID,
            items: [{ id: ITEM_ID, posX: 10, posY: 10 }],
          },
        }
      );

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());
      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());

      const expectedMutationVars = {
        input: { meId: MY_ID, itemId: ITEM_ID, roomId: ROOM_ID },
      };

      expect(await queryMocks[0]).toHaveBeenCalledWith(expectedMutationVars);
      expect(await queryMocks[1]).toHaveBeenCalledWith(expectedMutationVars);
    });

    it('mutates the item position', async () => {
      const { queryMocks } = renderWithApollo(
        RoomBoard,
        [
          makeHappyLockRoomBoardItemMutationStub({
            meId: MY_ID,
            itemId: ITEM_ID,
            roomId: ROOM_ID,
          }),
          makeHappyUpdateRoomBoardItemMutationStub(),
          makeHappyUnlockRoomBoardItemMutationStub({
            meId: MY_ID,
            itemId: ITEM_ID,
            roomId: ROOM_ID,
          }),
        ],
        {
          propsData: {
            myId: MY_ID,
            roomId: ROOM_ID,
            items: [makeItem({ id: ITEM_ID, posX: 10, posY: 10 })],
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

      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());

      const expectedMutationVars = {
        input: {
          id: ROOM_ID,
          items: [
            {
              id: ITEM_ID,
              posX: 30,
              posY: 20,
              lockedBy: MY_ID,
            },
          ],
        },
      };

      expect(await queryMocks[1]).toHaveBeenCalledWith(expectedMutationVars);
    });

    it('the item no longer has the data-moving attribute (vue-jest / jsdom do not support style tags)', async () => {
      renderWithApollo(
        RoomBoard,
        [
          makeHappyLockRoomBoardItemMutationStub({
            meId: MY_ID,
            itemId: ITEM_ID,
            roomId: ROOM_ID,
          }),
          makeHappyUpdateRoomBoardItemMutationStub(),
          makeHappyUnlockRoomBoardItemMutationStub({
            meId: MY_ID,
            itemId: ITEM_ID,
            roomId: ROOM_ID,
          }),
        ],
        {
          propsData: {
            myId: MY_ID,
            roomId: ROOM_ID,
            items: [makeItem({ id: ITEM_ID, posX: 10, posY: 10 })],
          },
        }
      );
      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());
      await waitFor(() =>
        expect(screen.getByRole('listitem')).toHaveAttribute('data-moving')
      );
      await fireEvent(
        screen.getByRole('listitem'),
        new PointerMoveEvent({
          movementX: 20,
          movementY: 10,
        })
      );

      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());
      await waitFor(() =>
        expect(screen.getByRole('listitem')).not.toHaveAttribute('data-moving')
      );
    });
  });

  describe('when props change', () => {
    it('updates based upon the new props', async () => {
      const { updateProps } = renderWithApollo(
        RoomBoard,
        makeHappyUpdateRoomBoardItemMutationStub(),
        {
          propsData: {
            myId: MY_ID,
            roomId: ROOM_ID,
            items: [makeItem({ id: ITEM_ID, posX: 10, posY: 10 })],
          },
        }
      );

      expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  10px;
      left: 10px;
    `);

      await updateProps({
        myId: MY_ID,
        roomId: ROOM_ID,
        items: [makeItem({ id: ITEM_ID, posX: 20, posY: 20 })],
      });

      expect(screen.getByRole('listitem')).toHaveStyle(`
        top:  20px;
        left: 20px;
      `);
    });
  });
});
