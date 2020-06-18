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
import {
  makeHappyUpdateRoomBoardItemMutationStub,
  makeSadUpdateRoomBoardItemMutationStub,
} from '@/testHelpers/testMutationStubs';
import {
  PRIMARY_MOUSE_BUTTON_ID,
  SECONDARY_MOUSE_BUTTON_ID,
} from '@/common/dom';
import { sleep } from '@/testHelpers/timeout';

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

  it('fires an moving start event when clicking with a pointer', async () => {
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

  it('fires an moving start event when clicking with a mouse button', async () => {
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
      new PointerDownEvent({ pointerId: 1000, button: PRIMARY_MOUSE_BUTTON_ID })
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

  it('does not fire the moving start event for a mouse click which is not the primary button', async () => {
    const { emitted } = render(RoomBoardItem, {
      propsData: {
        id: 'item123',
        posX: 2,
        posY: 1,
      },
    });

    await fireEvent(
      screen.getByRole('listitem'),
      new PointerDownEvent({
        pointerId: 1000,
        button: SECONDARY_MOUSE_BUTTON_ID,
      })
    );

    expect(emitted().movestart).toBeUndefined();
  });

  it('lets me edit the item and sends the update', async () => {
    const itemId = 'item123';
    const updatedText = 'updated content';

    const { queryMocks } = renderWithApollo(
      RoomBoardItem,
      [
        makeHappyUpdateRoomBoardItemMutationStub({
          id: itemId,
          text: updatedText,
        }),
      ],
      {
        propsData: {
          id: itemId,
          posX: 2,
          posY: 1,
          text: 'some text',
        },
        mocks: {
          $toasted: { global: { apollo_error: jest.fn() } },
        },
      }
    );

    await userEvent.dblClick(screen.getByRole('listitem'));
    await fireEvent.input(screen.getByRole('textbox'), {
      target: { innerText: updatedText },
    });
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', { name: /save/i })
    );
    await waitFor(() =>
      expect(queryMocks[0]).toHaveBeenCalledWith({
        input: { id: itemId, text: updatedText },
      })
    );
  });

  it('sends a toast update when an error occurs', async () => {
    const updatedText = 'updated content';
    const itemId = 'item123';
    const $toasted = {
      global: {
        apollo_error: jest.fn(),
      },
    };
    renderWithApollo(
      RoomBoardItem,
      [
        makeSadUpdateRoomBoardItemMutationStub({
          id: itemId,
          text: updatedText,
        }),
      ],
      {
        propsData: {
          id: itemId,
          posX: 2,
          posY: 1,
          text: 'some text',
        },
        mocks: {
          $toasted: $toasted,
        },
      }
    );

    await userEvent.dblClick(screen.getByRole('listitem'));
    await fireEvent.input(screen.getByRole('textbox'), {
      target: { innerText: updatedText },
    });
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await sleep(5);

    expect($toasted.global.apollo_error).toHaveBeenCalledWith(
      'Could not save item changes: GraphQL error: everything is broken'
    );
  });
});
