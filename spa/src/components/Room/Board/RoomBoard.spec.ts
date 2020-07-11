import {
  fireEvent,
  QuerySpec,
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
import { buildItemViewModel } from '@/testHelpers/testData';
import userEvent from '@testing-library/user-event';
import {
  ITEM_ID,
  makeHappyLockRoomBoardItemMutationStub,
  makeHappyMoveBoardItemMutationStub,
  makeHappyUnlockRoomBoardItemMutationStub,
  makeHappyUpdateBoardItemTextMutationStub,
  makeSadLockRoomBoardItemMutationStub,
  makeSadMoveBoardItemMutationStub,
  makeSadUnlockRoomBoardItemMutationStub,
  MY_ID,
  ROOM_ID,
} from '@/testHelpers/itemQueryStubs';

import { supportsTouchEvents } from '@/common/dom';
import { sleep } from '@/testHelpers/timeout';
import { ItemViewModel } from '@/components/Room/Board/items';

jest.mock('@/common/dom', () => ({
  supportsTouchEvents: jest.fn().mockReturnValue(true),
}));

interface RoomBoardComponentProps {
  myId: string;
  roomId: string;
  zoomFactor: number;
  items: ItemViewModel[];
}

const renderComponent = (
  props: Partial<RoomBoardComponentProps> = {},
  queries: QuerySpec[] = []
) => {
  const mocks = {
    $toasted: {
      global: {
        apollo_error: jest.fn(),
      },
    },
  };

  return {
    ...renderWithApollo(RoomBoard, queries, {
      propsData: {
        myId: MY_ID,
        zoomFactor: 1,
        roomId: ROOM_ID,
        items: [buildItemViewModel({ id: ITEM_ID, posX: 10, posY: 10 })],
        ...props,
      },
      mocks,
    }),
    mocks,
  };
};

describe('<room-board />', () => {
  it('renders a item defaulting at 10px by 10px', () => {
    renderComponent();

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  10px;
      left: 10px;
    `);
  });
  it('rerenders items when the props change', async () => {
    const { updateProps } = renderComponent(
      {
        items: [buildItemViewModel({ id: ITEM_ID, posX: 10, posY: 10 })],
      },
      [makeHappyMoveBoardItemMutationStub()]
    );

    expect(screen.getByRole('listitem')).toHaveStyle(`top:  10px; left: 10px;`);

    await updateProps({
      items: [buildItemViewModel({ id: ITEM_ID, posX: 20, posY: 20 })],
    });

    expect(screen.getByRole('listitem')).toHaveStyle(`top:  20px; left: 20px;`);
  });
  describe('when editing an item', () => {
    it('lets me edit an item', async () => {
      renderComponent();

      await userEvent.dblClick(screen.getByRole('listitem'));

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    it('does not let me edit an item if I am already editing one', async () => {
      renderComponent({
        items: [
          buildItemViewModel({ id: 'ITEM_1' }),
          buildItemViewModel({ id: 'ITEM_2' }),
        ],
      });

      const items = screen.getAllByRole('listitem');
      await userEvent.dblClick(items[0]);
      expect(screen.getAllByRole('textbox')).toHaveLength(1);
      await userEvent.dblClick(items[1]);
      expect(screen.getAllByRole('textbox')).toHaveLength(1);
    });
    it('lets me edit different items in sequence', async () => {
      renderComponent(
        {
          items: [
            buildItemViewModel({ id: 'ITEM_1' }),
            buildItemViewModel({ id: 'ITEM_2' }),
          ],
        },
        [
          makeHappyUpdateBoardItemTextMutationStub({
            id: 'ITEM_1',
            text: 'placeholder text',
          }),
        ]
      );

      const items = screen.getAllByRole('listitem');
      await userEvent.dblClick(items[0]);
      expect(screen.getAllByRole('textbox')).toHaveLength(1);
      await userEvent.click(screen.getByRole('button', { name: /save/i }));
      expect(screen.queryAllByRole('textbox')).toHaveLength(0);
      await userEvent.dblClick(items[1]);
      expect(screen.getAllByRole('textbox')).toHaveLength(1);
    });
  });
  describe('when moving', () => {
    it('locks the item', async () => {
      const { queryMocks } = renderComponent(
        {
          items: [buildItemViewModel({ id: ITEM_ID })],
        },
        [makeHappyLockRoomBoardItemMutationStub({ id: ITEM_ID })]
      );

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());

      //Best I can do for style atm since vue-jest / jsdom do not support style tags
      expect(screen.getByRole('listitem')).toHaveAttribute('data-moving');

      expect(queryMocks[0]).toHaveBeenCalledWith({
        input: { lockedBy: MY_ID, id: ITEM_ID },
      });
    });
    it('updates the position', async () => {
      renderComponent(
        {
          items: [buildItemViewModel({ id: ITEM_ID, posX: 10, posY: 10 })],
        },
        [makeHappyLockRoomBoardItemMutationStub({ id: ITEM_ID })]
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
    it('allows moving a locked item if i locked it', async () => {
      (supportsTouchEvents as jest.Mock).mockReturnValue(true);
      const { queryMocks } = renderComponent(
        {
          items: [
            buildItemViewModel({
              id: ITEM_ID,
              posX: 10,
              posY: 10,
              lockedBy: MY_ID,
            }),
          ],
        },
        [makeHappyLockRoomBoardItemMutationStub()]
      );

      const item = screen.getByRole('listitem');
      await fireEvent(item, new PointerDownEvent());
      await fireEvent(
        item,
        new PointerMoveEvent({ movementX: 20, movementY: 10 })
      );

      expect(item).toHaveStyle('top:  20px; left: 30px;');
      expect(queryMocks[0]).toHaveBeenCalledWith({
        input: {
          lockedBy: MY_ID,
          id: ITEM_ID,
        },
      });
    });
    it('does not move the item if it has been locked by somebody else', async () => {
      (supportsTouchEvents as jest.Mock).mockReturnValue(true);
      renderComponent({
        items: [
          buildItemViewModel({
            id: ITEM_ID,
            posX: 10,
            posY: 10,
            lockedBy: 'someone-else',
          }),
        ],
      });

      const item = screen.getByRole('listitem');
      await fireEvent(item, new PointerDownEvent());
      await fireEvent(
        item,
        new PointerMoveEvent({ movementX: 20, movementY: 10 })
      );

      expect(item).toHaveStyle('top: 10px; left: 10px;');
    });
    it('displays a toast update when an error occurs while locking', async () => {
      const { mocks } = renderComponent(
        {
          items: [buildItemViewModel({ id: ITEM_ID })],
        },
        [makeSadLockRoomBoardItemMutationStub({ id: ITEM_ID })]
      );

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());
      await sleep(5);

      expect(mocks.$toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not move the item: GraphQL error: everything is broken'
      );
    });
    it('unlocks after moving', async () => {
      const { queryMocks } = await renderComponent(
        {
          items: [buildItemViewModel({ id: ITEM_ID })],
        },
        [
          makeHappyLockRoomBoardItemMutationStub({ id: ITEM_ID }),
          makeHappyUnlockRoomBoardItemMutationStub({ id: ITEM_ID }),
          makeHappyMoveBoardItemMutationStub({ id: ITEM_ID }),
        ]
      );
      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());
      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());

      await waitFor(() => {
        return expect(queryMocks[1]).toHaveBeenCalledWith({
          input: { id: ITEM_ID },
        });
      });

      expect(screen.getByRole('listitem')).not.toHaveAttribute('data-moving');
    });
    it('remotely updates the item position', async () => {
      const { queryMocks } = await renderComponent(
        {
          items: [buildItemViewModel({ id: ITEM_ID, posY: 10, posX: 10 })],
        },
        [
          makeHappyLockRoomBoardItemMutationStub({ id: ITEM_ID }),
          makeHappyUnlockRoomBoardItemMutationStub({ id: ITEM_ID }),
          makeHappyMoveBoardItemMutationStub({ id: ITEM_ID }),
        ]
      );
      const item = screen.getByRole('listitem');
      await fireEvent(item, new PointerDownEvent());
      await fireEvent(
        item,
        new PointerMoveEvent({ movementX: 20, movementY: 10 })
      );
      await fireEvent(item, new PointerUpEvent());

      expect(queryMocks[2]).toHaveBeenCalledWith({
        input: { id: ITEM_ID, posX: 30, posY: 20 },
      });
    });
    it('displays a toast update when an error occurs while unlocking', async () => {
      const { mocks } = renderComponent(
        {
          items: [buildItemViewModel({ id: ITEM_ID, posX: 10, posY: 10 })],
        },
        [
          makeHappyLockRoomBoardItemMutationStub(),
          makeSadUnlockRoomBoardItemMutationStub(),
          makeHappyMoveBoardItemMutationStub(),
        ]
      );

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());
      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());
      await sleep(5);

      expect(mocks.$toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not update the item: GraphQL error: everything is broken'
      );
    });
    it('displays a toast update when an error occurs while mutating the position', async () => {
      const { mocks } = renderComponent(
        {
          items: [buildItemViewModel()],
        },
        [
          makeHappyLockRoomBoardItemMutationStub(),
          makeHappyUnlockRoomBoardItemMutationStub(),
          makeSadMoveBoardItemMutationStub(),
        ]
      );

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());
      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());
      await sleep(5);

      expect(mocks.$toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not update the item: GraphQL error: everything is broken'
      );
    });
  });
});
