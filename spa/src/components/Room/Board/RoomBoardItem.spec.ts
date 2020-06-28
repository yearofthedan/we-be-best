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
  makeHappyDeleteBoardItemMutationStub,
  makeSadDeleteBoardItemMutationStub,
} from '@/testHelpers/testMutationStubs';
import {
  PRIMARY_MOUSE_BUTTON_ID,
  SECONDARY_MOUSE_BUTTON_ID,
  supportsTouchEvents,
} from '@/common/dom';
import { sleep } from '@/testHelpers/timeout';
import {
  BLACKEST_BLACK,
  LIGHT_ORANGE,
} from '@/components/Room/Board/itemBuilder';
import { makeItem } from '@/testHelpers/testData';

jest.mock('@/common/dom');

describe('<room-board-item />', () => {
  it('renders the positioning based upon the x and y props', () => {
    render(RoomBoardItem, {
      propsData: {
        myId: 'me',
        item: makeItem({ posX: 2, posY: 1 }),
        moving: false,
      },
    });

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  1px;
      left: 2px;
    `);
  });

  it('renders a default themed style', () => {
    render(RoomBoardItem, {
      propsData: {
        myId: 'me',
        item: makeItem(),
        moving: false,
      },
    });

    expect(screen.getByRole('listitem')).toHaveStyle(`
      --theme-primary-colour: var(--colour-primary-emphasis);
      --theme-text-colour: var(--colour-background);
    `);
  });

  it('renders the text', () => {
    render(RoomBoardItem, {
      propsData: {
        myId: 'me',
        item: makeItem({ text: 'some text' }),
        moving: false,
      },
    });

    expect(screen.getByText('some text')).toBeInTheDocument();
  });

  describe('moving start', () => {
    it('fires a moving start event when clicking with a pointer', async () => {
      (supportsTouchEvents as jest.Mock).mockReturnValue(true);
      const { emitted } = render(RoomBoardItem, {
        propsData: {
          myId: 'me',
          item: makeItem({ id: 'item123', posX: 2, posY: 1 }),
          moving: true,
        },
      });

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());

      expect(emitted().movestart).not.toBeUndefined();
      expect(emitted().movestart[0]).toEqual([
        {
          pointerId: 1,
          itemId: 'item123',
        },
      ]);
    });

    it('does not fire anything when clicking with a pointer if touch is not enabled', async () => {
      (supportsTouchEvents as jest.Mock).mockReturnValue(false);
      const { emitted } = render(RoomBoardItem, {
        propsData: {
          myId: 'me',
          item: makeItem({ id: 'item123', posX: 2, posY: 1 }),
          moving: true,
        },
      });

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerDownEvent({ pointerId: 1000 })
      );

      expect(emitted().movestart).toBeUndefined();
    });

    it('fires a moving start event for a mouse click when touch is not enabled', async () => {
      (supportsTouchEvents as jest.Mock).mockReturnValue(false);
      const { emitted } = render(RoomBoardItem, {
        propsData: {
          myId: 'me',
          item: makeItem({ id: 'item123', posX: 2, posY: 1 }),
          moving: true,
        },
      });

      await fireEvent.mouseDown(screen.getByRole('listitem'), {
        button: PRIMARY_MOUSE_BUTTON_ID,
      });

      expect(emitted().movestart).not.toBeUndefined();
      expect(emitted().movestart[0]).toEqual([
        {
          pointerId: 1,
          itemId: 'item123',
        },
      ]);
    });

    it('fires nothing for a mouse click when touch is enabled', async () => {
      (supportsTouchEvents as jest.Mock).mockReturnValue(true);
      const { emitted } = render(RoomBoardItem, {
        propsData: {
          myId: 'me',
          item: makeItem({ id: 'item123', posX: 2, posY: 1 }),
          moving: true,
        },
      });

      await fireEvent.mouseDown(screen.getByRole('listitem'));

      expect(emitted().movestart).toBeUndefined();
    });

    it('fires a moving start event when the item is locked by me', async () => {
      const { emitted } = render(RoomBoardItem, {
        propsData: {
          myId: 'me',
          item: makeItem({ lockedBy: 'someone' }),
          moving: true,
        },
      });

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerDownEvent({ pointerId: 1000 })
      );

      expect(emitted().movestart).toBeUndefined();
    });

    it('does not fire the moving start event when the item is locked by someone else', async () => {
      const { emitted } = render(RoomBoardItem, {
        propsData: {
          myId: 'me',
          item: makeItem({ lockedBy: 'someone' }),
          moving: true,
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
          myId: 'me',
          item: makeItem(),
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
          myId: 'me',
          item: makeItem({
            id: itemId,
            posX: 2,
            posY: 1,
            text: 'some text',
          }),
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

  it('lets me edit the item and update the themed style', async () => {
    render(RoomBoardItem, {
      propsData: {
        myId: 'me',
        item: makeItem({
          id: 'item123',
          posX: 2,
        }),
        moving: false,
      },
    });

    await userEvent.dblClick(screen.getByRole('listitem'));
    await userEvent.click(screen.getByRole('radio', { name: /style-3/i }));

    expect(screen.getByRole('listitem')).toHaveStyle(`
      --theme-primary-colour: ${LIGHT_ORANGE};
      --theme-text-colour: ${BLACKEST_BLACK};
    `);
  });

  it('displays a toast update when an error occurs while updating', async () => {
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
          myId: 'me',
          item: makeItem({
            id: itemId,
            posX: 2,
            posY: 1,
            text: 'some text',
          }),
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
  it('lets me edit the item and delete', async () => {
    const itemId = 'item123';

    const { queryMocks } = renderWithApollo(
      RoomBoardItem,
      [
        makeHappyDeleteBoardItemMutationStub({
          id: itemId,
        }),
      ],
      {
        propsData: {
          myId: 'me',
          item: makeItem({
            id: itemId,
            posX: 2,
            posY: 1,
            text: 'some text',
          }),
        },
        mocks: {
          $toasted: { global: { apollo_error: jest.fn() } },
        },
      }
    );

    await userEvent.dblClick(screen.getByRole('listitem'));
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() =>
      expect(queryMocks[0]).toHaveBeenCalledWith({ id: itemId })
    );
  });

  it('displays a toast update when an error occurs while deleting', async () => {
    const itemId = 'item123';
    const $toasted = {
      global: {
        apollo_error: jest.fn(),
      },
    };
    renderWithApollo(
      RoomBoardItem,
      [
        makeSadDeleteBoardItemMutationStub({
          id: itemId,
        }),
      ],
      {
        propsData: {
          myId: 'me',
          item: makeItem({
            id: itemId,
            posX: 2,
            posY: 1,
            text: 'some text',
          }),
        },
        mocks: {
          $toasted: $toasted,
        },
      }
    );

    await userEvent.dblClick(screen.getByRole('listitem'));
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    await sleep(5);

    expect($toasted.global.apollo_error).toHaveBeenCalledWith(
      'Could not remove item: GraphQL error: everything is broken'
    );
  });
});
