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
import { AddRoomBoardItemInput } from '@/components/Room/boardItemsGraphQL';
import { makeItem } from '@/testHelpers/testData';
import userEvent from '@testing-library/user-event';
import { DEFAULT_X, DEFAULT_Y } from '@/components/Room/itemBuilder';
import {
  ITEM_ID,
  makeHappyAddRoomBoardItemMutationStub,
  makeHappyLockRoomBoardItemMutationStub,
  makeHappyUnlockRoomBoardItemMutationStub,
  makeHappyUpdateRoomBoardItemMutationStub,
  MY_ID,
  ROOM_ID,
} from '@/testHelpers/testMutationStubs';
import {resetAllWhenMocks, verifyAllWhenMocksCalled} from 'jest-when';

describe('<room-board />', () => {
  beforeEach(() => {
    resetAllWhenMocks();
  })
  it('renders a item defaulting at 10px by 10px', () => {
    renderWithApollo(RoomBoard, [], {
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

  describe('when adding an item', () => {
    it('lets me add an item', async () => {
      renderWithApollo(RoomBoard, [makeHappyAddRoomBoardItemMutationStub({
        roomId: ROOM_ID,
        itemId: expect.any(String),
        posX: DEFAULT_X,
        posY: DEFAULT_Y,
      })], {
        propsData: { myId: MY_ID, roomId: ROOM_ID, items: [] },
      });

      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: /add/i }));

      expect(await screen.findAllByRole('listitem')).toHaveLength(1);
    });

    it('sends an update when an item is created', async () => {
      renderWithApollo(
        RoomBoard,
        [makeHappyAddRoomBoardItemMutationStub({
          roomId: ROOM_ID,
          itemId: expect.any(String),
          posX: DEFAULT_X,
          posY: DEFAULT_Y,
        })],
        {
          propsData: {
            myId: MY_ID,
            roomId: ROOM_ID,
            items: [],
          },
        }
      );

      await userEvent.click(screen.getByRole('button', { name: /add/i }));

      verifyAllWhenMocksCalled();
    });
  });
  describe('when locked', () => {
    it('allows moving a locked item if i locked it', async () => {
      renderWithApollo(
        RoomBoard,
        [
          makeHappyLockRoomBoardItemMutationStub({
            lockedBy: MY_ID,
            id: ITEM_ID,
          })
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
            lockedBy: MY_ID,
            id: ITEM_ID,
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

      verifyAllWhenMocksCalled();
    });
  });
  describe('when moving', () => {
    it('assigns the data-moving property item (vue-jest / jsdom do not support style tags)', async () => {
      renderWithApollo(
        RoomBoard,
        [makeHappyLockRoomBoardItemMutationStub(), makeHappyUpdateRoomBoardItemMutationStub()],
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
        [makeHappyLockRoomBoardItemMutationStub(), makeHappyUpdateRoomBoardItemMutationStub()],
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
      renderWithApollo(
        RoomBoard,
        [
          makeHappyLockRoomBoardItemMutationStub({
            lockedBy: MY_ID,
            id: ITEM_ID,
          }),
          makeHappyUnlockRoomBoardItemMutationStub({
            id: ITEM_ID,
          }),
          makeHappyUpdateRoomBoardItemMutationStub({
            id: ROOM_ID,
            items: [ { id: ITEM_ID, lockedBy: 'me', posX: 10, posY: 10 } ]
          })
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
      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());

      verifyAllWhenMocksCalled();
    });

    it('mutates the item position', async () => {
      renderWithApollo(
        RoomBoard,
        [
          makeHappyLockRoomBoardItemMutationStub({
            lockedBy: MY_ID,
            id: ITEM_ID,
          }),
          makeHappyUpdateRoomBoardItemMutationStub({
            id: ROOM_ID,
            items: [
              {
                id: ITEM_ID,
                posX: 30,
                posY: 20,
                lockedBy: MY_ID,
              },
            ],
          }),
          makeHappyUnlockRoomBoardItemMutationStub({
            id: ITEM_ID,
          })],
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

      verifyAllWhenMocksCalled();
    });

    it('the item no longer has the data-moving attribute (vue-jest / jsdom do not support style tags)', async () => {
      renderWithApollo(
        RoomBoard,
        [
          makeHappyLockRoomBoardItemMutationStub({
            lockedBy: MY_ID,
            id: ITEM_ID,
          }),
          makeHappyUpdateRoomBoardItemMutationStub({
            id: ROOM_ID,
            items: [
              {
                id: ITEM_ID,
                posX: 30,
                posY: 20,
                lockedBy: MY_ID,
              },
            ],
          }),
          makeHappyUnlockRoomBoardItemMutationStub({
            id: ITEM_ID,
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
