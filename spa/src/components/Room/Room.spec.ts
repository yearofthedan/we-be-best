import Room from '@/components/Room/Room.vue';
import { renderWithApollo, screen } from '@/testHelpers/renderer';
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

const renderComponent = () =>
  renderWithApollo(
    Room,
    [
      makeHappyRoomQueryStub(),
      makeHappyRoomMemberUpdateSubscription(),
      makeHappyRoomItemUpdatesSubscription(),
      makeHappyAddRoomBoardItemMutationStub(),
    ],
    {
      propsData: { roomId: '123', myId: 'me' },
      stubs: {
        'transition-group': { template: '<ul><slot /></ul>' },
      },
      mocks: {
        $toasted: { global: { apollo_error: jest.fn() } },
      },
    }
  );

describe('<room />', () => {
  it('renders the members in the room', async () => {
    renderWithApollo(
      Room,
      [
        makeHappyRoomQueryStub(),
        makeHappyRoomMemberUpdateSubscription(),
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

  describe('changing board zoom', () => {
    it('defaults the factor to 1', async () => {
      renderComponent();

      expect(await screen.findByLabelText('board')).toHaveStyle(
        `--zoom-factor: 1;`
      );
    });

    it('increases the factor by 0.2 when I click to zoom in', async () => {
      renderComponent();

      const zoomInButton = await screen.findByRole('button', {
        name: 'zoom in',
      });
      await userEvent.click(zoomInButton);

      expect(screen.getByLabelText('board')).toHaveStyle(`--zoom-factor: 1.2;`);
    });

    it('decreases the factor by 0.2 when I click to zoom out', async () => {
      renderComponent();

      const zoomOutButton = await screen.findByRole('button', {
        name: 'zoom out',
      });
      await userEvent.click(zoomOutButton);

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
      const { queryMocks } = renderComponent();

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
            $toasted: $toasted,
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
    });
  });
});
