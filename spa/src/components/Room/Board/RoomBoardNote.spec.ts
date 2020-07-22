import {
  fireEvent,
  QuerySpec,
  renderWithApollo,
  screen,
} from '@/testHelpers/renderer';
import RoomBoardNote from '@/components/Room/Board/RoomBoardNote.vue';
import { PointerDownEvent } from '@/testHelpers/jsdomFriendlyPointerEvents';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/dom';
import {
  makeHappyAddRoomBoardNoteMutationStub,
  makeHappyDeleteBoardNoteMutationStub,
  makeHappyUpdateBoardNoteStyleMutationStub,
  makeHappyUpdateBoardNoteTextMutationStub,
  makeSadAddRoomBoardNoteMutationStub,
  makeSadDeleteBoardNoteMutationStub,
  makeSadUpdateBoardNoteStyleMutationStub,
  makeSadUpdateRoomBoardNoteMutationStub,
} from '@/testHelpers/noteQueryStubs';
import { MOUSE_BUTTONS, supportsTouchEvents } from '@/common/dom';
import { sleep } from '@/testHelpers/timeout';
import { buildNoteViewModel } from '@/testHelpers/viewModelBuilders';
import {
  BLACKEST_BLACK,
  LIGHT_CYAN,
  LIGHT_ORANGE,
} from '@/components/Room/Board/noteTheme';
import { NoteViewModel } from '@/components/Room/Board/notes';

jest.mock('@/common/dom');

interface RoomBoardNoteProps {
  myId: string;
  note: NoteViewModel;
  moving: boolean;
  editable: boolean;
  roomId: string;
}

const renderComponent = async (
  props: Partial<RoomBoardNoteProps> = {},
  queries?: QuerySpec[]
) => {
  const mocks = {
    $toasted: {
      global: {
        apollo_error: jest.fn(),
      },
    },
    $logger: {
      error: jest.fn(),
    },
  };

  const result = renderWithApollo(RoomBoardNote, queries || [], {
    propsData: {
      note: buildNoteViewModel(),
      editable: true,
      moving: false,
      myId: 'me',
      roomId: 'ROOM123',
      ...props,
    },
    mocks,
  });

  await screen.findByRole('listitem');
  return result;
};

describe('<room-board-note />', () => {
  beforeEach(() => {
    (supportsTouchEvents as jest.Mock).mockReturnValue(true);
  });
  describe('default rendering', () => {
    it('renders the positioning based upon the x and y props', () => {
      renderComponent({ note: buildNoteViewModel({ posX: 2, posY: 1 }) });

      expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  1px;
      left: 2px;
    `);
    });

    it('renders the text', () => {
      renderComponent({ note: buildNoteViewModel({ text: 'some text' }) });

      expect(screen.getByText('some text')).toBeInTheDocument();
    });

    it('renders the default themed style if the style is invalid', () => {
      renderComponent({ note: buildNoteViewModel({ style: 999 }) });

      expect(screen.getByRole('listitem')).toHaveStyle(`
      --theme-primary-colour: ${LIGHT_CYAN};
      --theme-text-colour: ${BLACKEST_BLACK};
    `);
    });
  });

  describe('moving', () => {
    describe('touch not enabled', () => {
      beforeEach(() => {
        (supportsTouchEvents as jest.Mock).mockReturnValue(false);
      });

      it('does not fire anything when clicking with a pointer', async () => {
        const { emitted } = await renderComponent();

        await fireEvent(
          screen.getByRole('listitem'),
          new PointerDownEvent({ pointerId: 1000 })
        );

        expect(emitted().pointerheld).toBeUndefined();
      });
      it('fires a pointerheld event for a mouse click', async () => {
        const { emitted } = await renderComponent();

        await userEvent.click(screen.getByRole('listitem'), {
          button: MOUSE_BUTTONS.primary,
        });

        expect(emitted().pointerheld).not.toBeUndefined();
        expect(emitted().pointerheld[0]).toEqual([
          {
            pointerId: 1,
            noteId: 'NOTE123',
          },
        ]);
      });
      it('does not fire the pointerheld event for a mouse click which is not the primary button', async () => {
        const { emitted } = await renderComponent();

        await fireEvent(
          screen.getByRole('listitem'),
          new PointerDownEvent({
            pointerId: 1000,
            // @ts-ignore
            button: MOUSE_BUTTONS.secondary,
          })
        );

        expect(emitted().pointerheld).toBeUndefined();
      });
    });

    describe('touch enabled', () => {
      beforeEach(() => {
        (supportsTouchEvents as jest.Mock).mockReturnValue(true);
      });

      it('fires a pointerheld event when clicking with a pointer', async () => {
        const { emitted } = await renderComponent();

        await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());

        expect(emitted().pointerheld).not.toBeUndefined();
        expect(emitted().pointerheld[0]).toEqual([
          {
            pointerId: 1,
            noteId: 'NOTE123',
          },
        ]);
      });
      it('fires nothing for a mouse click when touch is enabled', async () => {
        const { emitted } = await renderComponent();

        await fireEvent.mouseDown(screen.getByRole('listitem'));

        expect(emitted().pointerheld).toBeUndefined();
      });
    });

    it('fires a pointerheld event when the note is locked by me', async () => {
      const { emitted } = await renderComponent({
        note: buildNoteViewModel({ lockedBy: 'me' }),
      });

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerDownEvent({ pointerId: 1000 })
      );

      expect(emitted().pointerheld).not.toBeUndefined();
    });
    it('does not allow moving when the note is locked by someone else', async () => {
      const { emitted } = await renderComponent({
        note: buildNoteViewModel({ lockedBy: 'someone' }),
      });

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerDownEvent({ pointerId: 1000 })
      );

      expect(emitted().pointerheld).toBeUndefined();
    });
    it('does not allow moving when the note is new', async () => {
      const { emitted } = await renderComponent({
        note: buildNoteViewModel({ isNew: true }),
      });

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerDownEvent({ pointerId: 1000 })
      );

      expect(emitted().pointerheld).toBeUndefined();
    });
  });

  describe('editing', () => {
    const editTextAndSave = async (text: string) => {
      await userEvent.dblClick(screen.getByRole('listitem'));
      await fireEvent.input(screen.getByRole('textbox'), {
        target: { innerText: text },
      });
      await userEvent.click(screen.getByRole('button', { name: /save/i }));
    };

    it('lets me update the themed style while editing', async () => {
      const { queryMocks } = await renderComponent(
        {
          note: buildNoteViewModel({
            id: 'NOTE123',
            posX: 2,
            posY: 1,
          }),
        },
        [
          makeHappyUpdateBoardNoteStyleMutationStub({
            id: 'NOTE123',
            style: 3,
          }),
        ]
      );

      await userEvent.dblClick(screen.getByRole('listitem'));
      await userEvent.click(screen.getByRole('radio', { name: /style-3/i }));

      expect(screen.getByRole('listitem')).toHaveStyle(`
      --theme-primary-colour: ${LIGHT_ORANGE};
      --theme-text-colour: ${BLACKEST_BLACK};
    `);

      await waitFor(() =>
        expect(queryMocks[0]).toHaveBeenCalledWith({
          input: { id: 'NOTE123', style: 2 },
        })
      );
    });
    it('displays a toast update when an error occurs while updating style', async () => {
      const { mocks } = await renderComponent(
        {
          note: buildNoteViewModel({
            id: 'NOTE123',
            posX: 2,
            posY: 1,
          }),
        },
        [
          makeSadUpdateBoardNoteStyleMutationStub({
            id: 'NOTE123',
            style: 3,
          }),
        ]
      );

      await userEvent.dblClick(screen.getByRole('listitem'));
      await userEvent.click(screen.getByRole('radio', { name: /style-3/i }));
      await sleep(5);

      expect(mocks.$toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not save note style changes: GraphQL error: everything is broken'
      );
      expect(mocks.$logger.error).toHaveBeenCalled();
    });
    it('does not update a note content if it is being edited', async () => {
      const { updateProps } = await renderComponent({
        note: buildNoteViewModel({
          id: 'NOTE123',
          text: 'some text',
        }),
      });

      await userEvent.dblClick(screen.getByRole('listitem'));

      await updateProps({
        note: buildNoteViewModel({
          id: 'NOTE123',
          text: 'some updated text',
          posX: 100,
          posY: 100,
        }),
      });

      expect(screen.getByText('some text')).toBeInTheDocument();
      expect(screen.getByRole('listitem')).not.toHaveStyle(`
        top:  100px;
        left: 100px;
      `);
    });
    it('sends an editing event when I double click', async () => {
      const { emitted } = await renderComponent();

      await userEvent.dblClick(screen.getByRole('listitem'));
      expect(emitted().editstart).not.toBeUndefined();
      expect(emitted().editstart[0]).toEqual(['NOTE123']);
    });
    it('does not edit if the note is not editable', async () => {
      const { emitted } = await renderComponent({ editable: false });

      await userEvent.dblClick(screen.getByRole('listitem'));
      expect(emitted().editstart).toBeUndefined();
    });
    it('sends an update when I save while editing', async () => {
      const noteId = 'NOTE123';
      const updatedText = 'updated content';
      const { queryMocks } = await renderComponent(
        {
          note: buildNoteViewModel({
            id: noteId,
            text: 'some text',
          }),
        },
        [
          makeHappyUpdateBoardNoteTextMutationStub({
            id: noteId,
            text: updatedText,
          }),
        ]
      );

      await editTextAndSave(updatedText);
      await screen.findByText(updatedText);
      expect(queryMocks[0]).toHaveBeenCalledWith({
        input: { id: noteId, text: updatedText },
      });
    });
    it('adds rather than updating when the note is new', async () => {
      const noteId = 'NOTE123';
      const updatedText = 'updated content';
      const { queryMocks } = await renderComponent(
        {
          note: buildNoteViewModel({
            id: noteId,
            text: 'some text',
            isNew: true,
          }),
        },
        [
          makeHappyAddRoomBoardNoteMutationStub({
            noteId: noteId,
            text: updatedText,
          }),
        ]
      );

      await editTextAndSave(updatedText);
      await screen.findByText(updatedText);
      expect(queryMocks[0]).toHaveBeenCalledWith({
        input: {
          noteId: noteId,
          posX: 30,
          posY: 20,
          roomId: 'ROOM123',
          style: 0,
          text: 'some text',
        },
      });
    });
    it('displays a toast when an error occurs while adding', async () => {
      const updatedText = 'updated content';
      const noteId = 'NOTE123';
      const { mocks } = await renderComponent(
        {
          note: buildNoteViewModel({
            id: noteId,
            text: 'some text',
            isNew: true,
          }),
        },
        [makeSadAddRoomBoardNoteMutationStub()]
      );

      await editTextAndSave(updatedText);
      await sleep(5);

      expect(mocks.$toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not save note changes: GraphQL error: everything is broken'
      );
      expect(mocks.$logger.error).toHaveBeenCalled();
    });
    it('reverts to the original text when an error occurs while updating', async () => {
      const noteId = 'NOTE123';
      const updatedText = 'updated content';
      await renderComponent(
        {
          note: buildNoteViewModel({
            id: noteId,
            text: 'original text',
          }),
        },
        [
          makeSadUpdateRoomBoardNoteMutationStub({
            id: noteId,
            text: updatedText,
          }),
        ]
      );

      await editTextAndSave(updatedText);

      expect(await screen.findByText('original text')).toBeInTheDocument();
    });
    it('displays a toast update when an error occurs while updating', async () => {
      const updatedText = 'updated content';
      const noteId = 'NOTE123';
      const { mocks } = await renderComponent(
        {
          note: buildNoteViewModel({
            id: noteId,
          }),
        },
        [
          makeSadUpdateRoomBoardNoteMutationStub({
            id: noteId,
            text: updatedText,
          }),
        ]
      );

      await editTextAndSave(updatedText);
      await sleep(5);

      expect(mocks.$toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not save note changes: GraphQL error: everything is broken'
      );
      expect(mocks.$logger.error).toHaveBeenCalled();
    });
    it('lets me delete while editing', async () => {
      const { queryMocks } = await renderComponent(undefined, [
        makeHappyDeleteBoardNoteMutationStub({
          id: 'NOTE123',
        }),
      ]);

      await userEvent.dblClick(screen.getByRole('listitem'));
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() =>
        expect(queryMocks[0]).toHaveBeenCalledWith({ id: 'NOTE123' })
      );
    });
    it('displays a toast update when an error occurs while deleting', async () => {
      const { mocks } = await renderComponent(undefined, [
        makeSadDeleteBoardNoteMutationStub({
          id: 'NOTE123',
        }),
      ]);

      await userEvent.dblClick(screen.getByRole('listitem'));
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));
      await sleep(5);

      expect(mocks.$toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not remove note: GraphQL error: everything is broken'
      );
      expect(mocks.$logger.error).toHaveBeenCalled();
    });
  });
});
