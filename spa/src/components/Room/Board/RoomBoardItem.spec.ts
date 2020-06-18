import {
  fireEvent,
  render,
  renderWithApollo,
  screen,
} from '@/testHelpers/renderer';
import RoomBoardItem from '@/components/Room/Board/RoomBoardItem.vue';
import { PointerDownEvent } from '@/testHelpers/jsdomFriendlyPointerEvents';
import userEvent from '@testing-library/user-event';
import { waitFor, waitForElementToBeRemoved } from '@testing-library/dom';
import { makeHappyUpdateRoomBoardItemMutationStub } from '@/testHelpers/testMutationStubs';

describe('<room-board-item />', () => {
  it('renders the positioning based upon the x and y props', () => {
    render(RoomBoardItem, {
      propsData: {
        id: 'item123',
        posX: 2,
        posY: 1,
        moving: false,
      },
    });

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  1px;
      left: 2px;
    `);
  });

  it('renders the text', () => {
    render(RoomBoardItem, {
      propsData: {
        id: 'item123',
        posX: 2,
        posY: 1,
        moving: false,
        text: 'some text',
      },
    });

    expect(screen.getByText('some text')).toBeInTheDocument();
  });

  it('fires an moving start event when clicking on the item', async () => {
    const { emitted } = render(RoomBoardItem, {
      propsData: {
        id: 'item123',
        posX: 2,
        posY: 1,
        moving: true,
      },
    });

    await fireEvent(
      screen.getByRole('listitem'),
      new PointerDownEvent({ pointerId: 1000 })
    );

    expect(emitted().movestart).not.toBeUndefined();
    expect(emitted().movestart[0]).toEqual([
      {
        pointerId: 1000,
        itemId: 'item123',
      },
    ]);
  });

  it('does not fire the moving start event when the item is locked', async () => {
    const { emitted } = render(RoomBoardItem, {
      propsData: {
        id: 'item123',
        posX: 2,
        posY: 1,
        moving: true,
        lockedBy: 'someone',
      },
    });

    await fireEvent(
      screen.getByRole('listitem'),
      new PointerDownEvent({ pointerId: 1000 })
    );

    expect(emitted().movestart).toBeUndefined();
  });

  it('lets me edit the item and sends the update', async () => {
    const itemId = 'item123';
    const { queryMocks } = renderWithApollo(
      RoomBoardItem,
      [
        makeHappyUpdateRoomBoardItemMutationStub({
          id: itemId,
          text: 'some content',
        }),
      ],
      {
        propsData: {
          id: itemId,
          posX: 2,
          posY: 1,
          text: 'some text',
        },
      }
    );

    await userEvent.dblClick(screen.getByRole('listitem'));
    await fireEvent.input(screen.getByRole('textbox'), {
      target: { innerText: 'updated content' },
    });
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', { name: /save/i })
    );
    await waitFor(() =>
      expect(queryMocks[0]).toHaveBeenCalledWith({
        input: { id: itemId, text: 'updated content' },
      })
    );
  });
});
