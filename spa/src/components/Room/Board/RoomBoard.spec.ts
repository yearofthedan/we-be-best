import {
  fireEvent,
  renderWithApollo,
  screen,
  RenderResult,
} from '@/testHelpers/renderer';
import RoomBoard from '@/components/Room/Board/RoomBoard.vue';
import {
  PointerDownEvent,
  PointerMoveEvent,
  PointerUpEvent,
} from '@/testHelpers/jsdomFriendlyPointerEvents';
import { makeItem } from '@/testHelpers/testData';
import userEvent from '@testing-library/user-event';
import { DEFAULT_X, DEFAULT_Y } from '@/components/Room/Board/itemBuilder';
import {
  ITEM_ID,
  makeHappyAddRoomBoardItemMutationStub,
  makeHappyLockRoomBoardItemMutationStub,
  makeHappyUnlockRoomBoardItemMutationStub,
  makeHappyMoveBoardItemMutationStub,
  MY_ID,
  ROOM_ID,
} from '@/testHelpers/testMutationStubs';
import { resetAllWhenMocks } from 'jest-when';

describe('<room-board />', () => {
  afterEach(() => {
    resetAllWhenMocks();
  });
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
    let renderedContext: RenderResult;

    beforeEach(() => {
      renderedContext = renderWithApollo(
        RoomBoard,
        [makeHappyAddRoomBoardItemMutationStub()],
        {
          propsData: { myId: MY_ID, roomId: ROOM_ID, items: [] },
        }
      );
    });
    it('lets me add an item', async () => {
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: /add/i }));

      expect(await screen.findAllByRole('listitem')).toHaveLength(1);
    });

    it('sends an update when an item is created', async () => {
      await userEvent.click(screen.getByRole('button', { name: /add/i }));

      expect(renderedContext.queryMocks[0]).toHaveBeenCalledWith({
        input: {
          roomId: ROOM_ID,
          itemId: expect.any(String),
          posX: DEFAULT_X,
          posY: DEFAULT_Y,
        },
      });
    });
  });
  describe('when locked', () => {
    it('allows moving a locked item if i locked it', async () => {
      const { queryMocks } = renderWithApollo(
        RoomBoard,
        [makeHappyLockRoomBoardItemMutationStub()],
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
      expect(queryMocks[0]).toHaveBeenCalledWith({
        input: {
          lockedBy: MY_ID,
          id: ITEM_ID,
        },
      });
    });

    it('does not move the item if it has been locked by somebody else', async () => {
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
      const { queryMocks } = renderWithApollo(
        RoomBoard,
        [makeHappyLockRoomBoardItemMutationStub()],
        {
          propsData: {
            myId: MY_ID,
            roomId: ROOM_ID,
            items: [makeItem({ id: ITEM_ID, posX: 10, posY: 10 })],
          },
        }
      );

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());

      expect(queryMocks[0]).toHaveBeenCalledWith({
        input: { lockedBy: MY_ID, id: ITEM_ID },
      });
    });
  });
  describe('when moving', () => {
    beforeEach(() => {
      renderWithApollo(RoomBoard, [makeHappyLockRoomBoardItemMutationStub()], {
        propsData: {
          myId: MY_ID,
          roomId: ROOM_ID,
          items: [makeItem({ id: ITEM_ID, posX: 10, posY: 10 })],
        },
      });
    });
    it('assigns the data-moving property item (vue-jest / jsdom do not support style tags)', async () => {
      await fireEvent(
        screen.getByRole('listitem'),
        new PointerDownEvent({
          pointerId: 1000,
        })
      );

      expect(screen.getByRole('listitem')).toHaveAttribute('data-moving');
    });

    it('updates the position', async () => {
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
    let renderedContext: RenderResult;

    beforeEach(async () => {
      renderedContext = renderWithApollo(
        RoomBoard,
        [
          makeHappyLockRoomBoardItemMutationStub(),
          makeHappyUnlockRoomBoardItemMutationStub(),
          makeHappyMoveBoardItemMutationStub(),
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
    });

    it('unlocks the item', async () => {
      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());

      expect(renderedContext.queryMocks[1]).toHaveBeenCalledWith({
        input: { id: ITEM_ID },
      });
    });

    it('mutates the item position', async () => {
      await fireEvent(
        screen.getByRole('listitem'),
        new PointerMoveEvent({
          movementX: 20,
          movementY: 10,
        })
      );
      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());

      expect(renderedContext.queryMocks[2]).toHaveBeenCalledWith({
        input: { id: ITEM_ID, posX: 30, posY: 20 },
      });
    });

    it('no longer has the data-moving attribute (vue-jest / jsdom do not support style tags)', async () => {
      expect(screen.getByRole('listitem')).toHaveAttribute('data-moving');
      await fireEvent(
        screen.getByRole('listitem'),
        new PointerMoveEvent({
          movementX: 20,
          movementY: 10,
        })
      );

      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());
      expect(screen.getByRole('listitem')).not.toHaveAttribute('data-moving');
    });
  });
  describe('when props change', () => {
    it('updates based upon the new props', async () => {
      const { updateProps } = renderWithApollo(
        RoomBoard,
        makeHappyMoveBoardItemMutationStub(),
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
