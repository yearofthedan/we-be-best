import {
  fireEvent,
  renderWithApollo,
  screen,
  waitFor,
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
  makeHappyMoveBoardItemMutationStub,
  makeHappyUnlockRoomBoardItemMutationStub,
  makeSadAddRoomBoardItemMutationStub,
  makeSadLockRoomBoardItemMutationStub,
  makeSadMoveBoardItemMutationStub,
  makeSadUnlockRoomBoardItemMutationStub,
  MY_ID,
  ROOM_ID,
} from '@/testHelpers/itemQueryStubs';

import { supportsTouchEvents } from '@/common/dom';
import { sleep } from '@/testHelpers/timeout';

jest.mock('@/common/dom', () => ({
  supportsTouchEvents: jest.fn().mockReturnValue(true),
}));

describe('<room-board />', () => {
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
    const renderComponent = () => {
      return renderWithApollo(
        RoomBoard,
        [makeHappyAddRoomBoardItemMutationStub()],
        {
          propsData: { myId: MY_ID, roomId: ROOM_ID, items: [] },
          mocks: {
            $toasted: { global: { apollo_error: jest.fn() } },
          },
        }
      );
    };

    it('lets me add an item', async () => {
      renderComponent();
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: /add/i }));

      await screen.findByRole('listitem');
      expect(await screen.findByRole('textbox')).toBeInTheDocument();
    });

    it('sends an update when an item is created', async () => {
      const { queryMocks } = renderComponent();
      await userEvent.click(screen.getByRole('button', { name: /add/i }));

      expect(queryMocks[0]).toHaveBeenCalledWith({
        input: {
          roomId: ROOM_ID,
          itemId: expect.any(String),
          posX: DEFAULT_X,
          posY: DEFAULT_Y,
        },
      });
    });

    it('displays a toast update when an error occurs while adding', async () => {
      const $toasted = {
        global: {
          apollo_error: jest.fn(),
        },
      };

      renderWithApollo(RoomBoard, [makeSadAddRoomBoardItemMutationStub()], {
        propsData: { myId: MY_ID, roomId: ROOM_ID, items: [] },
        mocks: {
          $toasted: $toasted,
        },
      });

      await userEvent.click(screen.getByRole('button', { name: /add/i }));
      await sleep(5);

      expect($toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not add a new item: GraphQL error: everything is broken'
      );
    });
  });
  describe('when locked', () => {
    it('allows moving a locked item if i locked it', async () => {
      (supportsTouchEvents as jest.Mock).mockReturnValue(true);
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
      (supportsTouchEvents as jest.Mock).mockReturnValue(true);
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

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerMoveEvent({
          movementX: 20,
          movementY: 10,
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

    it('displays a toast update when an error occurs while locking', async () => {
      const $toasted = {
        global: {
          apollo_error: jest.fn(),
        },
      };

      renderWithApollo(RoomBoard, [makeSadLockRoomBoardItemMutationStub()], {
        propsData: {
          myId: MY_ID,
          roomId: ROOM_ID,
          items: [makeItem({ id: ITEM_ID, posX: 10, posY: 10 })],
        },
        mocks: {
          $toasted: $toasted,
        },
      });

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());
      await sleep(5);

      expect($toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not move the item: GraphQL error: everything is broken'
      );
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
    const renderMovingComponent = async () => {
      const renderResult = renderWithApollo(
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
          mocks: {
            $toasted: { global: { apollo_error: jest.fn() } },
          },
        }
      );
      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());
      return renderResult;
    };

    it('unlocks the item', async () => {
      const { queryMocks } = await renderMovingComponent();
      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());

      await waitFor(() => {
        return expect(queryMocks[1]).toHaveBeenCalledWith({
          input: { id: ITEM_ID },
        });
      });
    });

    it('displays a toast update when an error occurs while unlocking', async () => {
      const apolloErrorMock = jest.fn();

      renderWithApollo(
        RoomBoard,
        [
          makeHappyLockRoomBoardItemMutationStub(),
          makeSadUnlockRoomBoardItemMutationStub(),
          makeHappyMoveBoardItemMutationStub(),
        ],
        {
          propsData: {
            myId: MY_ID,
            roomId: ROOM_ID,
            items: [makeItem({ id: ITEM_ID, posX: 10, posY: 10 })],
          },
          mocks: {
            $toasted: { global: { apollo_error: apolloErrorMock } },
          },
        }
      );

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());
      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());
      await sleep(5);

      expect(apolloErrorMock).toHaveBeenCalledWith(
        'Could not update the item: GraphQL error: everything is broken'
      );
    });

    it('mutates the item position', async () => {
      const { queryMocks } = await renderMovingComponent();
      await fireEvent(
        screen.getByRole('listitem'),
        new PointerMoveEvent({
          movementX: 20,
          movementY: 10,
        })
      );
      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());

      expect(queryMocks[2]).toHaveBeenCalledWith({
        input: { id: ITEM_ID, posX: 30, posY: 20 },
      });
    });

    it('displays a toast update when an error occurs while mutating the position', async () => {
      const $toasted = {
        global: {
          apollo_error: jest.fn(),
        },
      };

      renderWithApollo(
        RoomBoard,
        [
          makeHappyLockRoomBoardItemMutationStub(),
          makeHappyUnlockRoomBoardItemMutationStub(),
          makeSadMoveBoardItemMutationStub(),
        ],
        {
          propsData: {
            myId: MY_ID,
            roomId: ROOM_ID,
            items: [makeItem({ id: ITEM_ID, posX: 10, posY: 10 })],
          },
          mocks: {
            $toasted: $toasted,
          },
        }
      );

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());
      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());
      await sleep(5);

      expect($toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not update the item: GraphQL error: everything is broken'
      );
    });

    it('no longer has the data-moving attribute (vue-jest / jsdom do not support style tags)', async () => {
      await renderMovingComponent();
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
