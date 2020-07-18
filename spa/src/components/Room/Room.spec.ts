import Room from '@/components/Room/Room.vue';
import { QuerySpec, renderWithApollo, screen } from '@/testHelpers/renderer';
import {
  makeHappyRoomItemUpdatesSubscription,
  makeHappyRoomMemberUpdateSubscription,
  makeHappyRoomQueryStub,
} from '@/testHelpers/roomQueryStubs';
import {
  buildItemResponse,
  makeHappyAddRoomBoardItemMutationStub,
  makeSadAddRoomBoardItemMutationStub,
  MY_ID,
  ROOM_ID,
} from '@/testHelpers/itemQueryStubs';
import userEvent from '@testing-library/user-event';
import { DEFAULT_X, DEFAULT_Y } from '@/components/Room/Board/items';
import { fireEvent, waitFor } from '@testing-library/dom';
import { sleep } from '@/testHelpers/timeout';

interface RoomComponentProps {
  myId: string;
  roomId: string;
}

const renderComponent = async (
  props: Partial<RoomComponentProps> = {},
  queries?: QuerySpec[]
) => {
  const mocks = {
    $toasted: {
      global: {
        apollo_error: jest.fn(),
      },
    },
  };

  const result = renderWithApollo(
    Room,
    queries || [
      makeHappyRoomQueryStub(),
      makeHappyRoomMemberUpdateSubscription(),
      makeHappyRoomItemUpdatesSubscription(),
      makeHappyAddRoomBoardItemMutationStub(),
    ],
    {
      propsData: { roomId: '123', myId: 'me', ...props },
      stubs: {
        'transition-group': { template: '<ul><slot /></ul>' },
      },
      mocks,
    }
  );

  await screen.findByLabelText('board');
  return result;
};

describe('<room />', () => {
  it('renders the members in the room', async () => {
    renderWithApollo(
      Room,
      [
        makeHappyRoomQueryStub(),
        makeHappyRoomMemberUpdateSubscription({
          successData: { name: 'my-mother' },
        }),
        makeHappyRoomItemUpdatesSubscription(),
      ],
      {
        propsData: { roomId: '123', myId: 'me' },
      }
    );

    expect(await screen.findByText(/me/)).toBeInTheDocument();
    expect(screen.getByText(/my-mother/)).toBeInTheDocument();
  });

  it('renders the initial and updated items on the board', async () => {
    const item = buildItemResponse({
      id: 'ITEM1',
      text: 'item-text',
      style: null,
    });
    const itemToBeUpdated = buildItemResponse({
      id: 'ITEM2',
      text: 'item-text',
      style: 2,
    });

    renderWithApollo(
      Room,
      [
        makeHappyRoomQueryStub({
          successData: { items: [item, itemToBeUpdated] },
        }),
        makeHappyRoomMemberUpdateSubscription(),
        makeHappyRoomItemUpdatesSubscription({
          successData: { ...itemToBeUpdated, text: 'more-item-text' },
        }),
      ],
      {
        propsData: { roomId: '123', myId: 'me' },
      }
    );

    expect(await screen.findByText('item-text')).toBeInTheDocument();
    expect(await screen.findByText('more-item-text')).toBeInTheDocument();
  });

  it('lets me download all the data', async () => {
    await renderComponent(
      {
        roomId: 'ROOM123',
      },
      [
        makeHappyRoomQueryStub(),
        makeHappyRoomMemberUpdateSubscription(),
        makeHappyRoomItemUpdatesSubscription(),
      ]
    );

    const link = screen.getByRole('link', { name: /download data/i });
    await userEvent.click(link);

    const href =
      'data:text/json;charset=utf-8,%7B%22room%22%3A%7B%22id%22%3A%22ROOM123%22%2C%22members%22%3A%5B%7B%22id%22%3A%22aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee%22%2C%22name%22%3A%22me%22%7D%2C%7B%22id%22%3A%222%22%2C%22name%22%3A%22PERSON%22%7D%5D%2C%22items%22%3A%5B%7B%22id%22%3A%22ITEM1%22%2C%22posX%22%3A30%2C%22posY%22%3A20%2C%22lockedBy%22%3A%22me%22%2C%22text%22%3A%22placeholder%20text%22%2C%22style%22%3A2%2C%22isDeleted%22%3Anull%2C%22isNew%22%3Anull%7D%2C%7B%22id%22%3A%22ITEMM1234%22%2C%22posX%22%3A30%2C%22posY%22%3A20%2C%22lockedBy%22%3A%22me%22%2C%22text%22%3A%22placeholder%20text%22%2C%22style%22%3A2%2C%22isDeleted%22%3Anull%2C%22isNew%22%3Anull%7D%5D%7D%7D';
    expect(link).toHaveAttribute('href', href);
  });

  it('lets me copy the room url for sharing', async () => {
    // @ts-ignore
    const clipboard = (global.navigator.clipboard = { writeText: jest.fn() });

    await renderComponent({
      roomId: 'ROOM123',
    });

    await userEvent.click(
      screen.getByRole('button', { name: /copy room link/i })
    );
    expect(clipboard.writeText).toHaveBeenCalledWith('localhost/?room=ROOM123');
  });

  describe('changing board zoom', () => {
    it('defaults the factor to 1', async () => {
      await renderComponent();

      expect(screen.getByLabelText('board')).toHaveStyle(`--zoom-factor: 1;`);
    });

    it('increases the factor by 0.2 when I click to zoom in', async () => {
      await renderComponent();

      await userEvent.click(screen.getByRole('button', { name: 'zoom in' }));

      expect(screen.getByLabelText('board')).toHaveStyle(`--zoom-factor: 1.2;`);
    });

    it('decreases the factor by 0.2 when I click to zoom out', async () => {
      await renderComponent();

      await userEvent.click(screen.getByRole('button', { name: 'zoom out' }));

      expect(screen.getByLabelText('board')).toHaveStyle(`--zoom-factor:0.8;`);
    });
  });
  describe('changing board background', () => {
    it('defaults to quadrants', async () => {
      renderComponent();

      await waitFor(() =>
        expect(screen.getByLabelText('board')).toHaveAttribute(
          'data-background',
          'QUADRANTS'
        )
      );
    });

    it('switches to blank when selected', async () => {
      renderComponent();

      const selectBox = await screen.findByLabelText('Background');

      await fireEvent.change(selectBox, { target: { value: 'BLANK' } });

      expect(await screen.findByLabelText('board')).toHaveAttribute(
        'data-background',
        'BLANK'
      );
    });
  });

  describe('when adding an item', () => {
    it('lets me add an item', async () => {
      const { queryMocks } = await renderComponent();

      await screen.findByRole('button', { name: /add/i });
      await userEvent.click(screen.getByRole('button', { name: /add/i }));

      await waitFor(() =>
        expect(queryMocks[3]).toHaveBeenCalledWith({
          input: {
            roomId: '123',
            itemId: expect.any(String),
            posX: DEFAULT_X,
            posY: DEFAULT_Y,
          },
        })
      );
    });

    it('displays a toast update when an error occurs while adding', async () => {
      const $toasted = {
        global: {
          apollo_error: jest.fn(),
        },
      };

      const $logger = {
        error: jest.fn(),
      };

      renderWithApollo(
        Room,
        [
          makeHappyRoomQueryStub({
            successData: { items: [] },
          }),
          makeHappyRoomMemberUpdateSubscription(),
          makeHappyRoomItemUpdatesSubscription(),
          makeSadAddRoomBoardItemMutationStub(),
        ],
        {
          propsData: { myId: MY_ID, roomId: ROOM_ID, items: [] },
          mocks: {
            $toasted,
            $logger,
          },
        }
      );

      await userEvent.click(
        await screen.findByRole('button', { name: /add/i })
      );
      await sleep(5);
      expect($toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not add a new item: GraphQL error: everything is broken'
      );
      expect($logger.error).toHaveBeenCalled();
    });
  });
});
