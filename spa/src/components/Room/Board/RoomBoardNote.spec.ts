import {
  fireEvent,
  render,
  renderWithApollo,
  screen,
} from '@/testHelpers/renderer';
import RoomBoardNote from '@/components/Room/Board/RoomBoardNote.vue';
import { PointerDownEvent } from '@/testHelpers/jsdomFriendlyPointerEvents';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/dom';
import {
  makeHappyDeleteBoardNoteMutationStub,
  makeHappyUpdateBoardNoteStyleMutationStub,
  makeHappyUpdateBoardNoteTextMutationStub,
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

jest.mock('@/common/dom');

describe('<room-board-note />', () => {
  beforeEach(() => {
    (supportsTouchEvents as jest.Mock).mockReturnValue(true);
  });
  describe('default rendering', () => {
    it('renders the positioning based upon the x and y props', () => {
      render(RoomBoardNote, {
        propsData: {
          myId: 'me',
          note: buildNoteViewModel({ posX: 2, posY: 1 }),
          moving: false,
          editable: true,
        },
      });

      expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  1px;
      left: 2px;
    `);
    });

    it('renders the text', () => {
      render(RoomBoardNote, {
        propsData: {
          myId: 'me',
          note: buildNoteViewModel({ text: 'some text' }),
          moving: false,
          editable: true,
        },
      });

      expect(screen.getByText('some text')).toBeInTheDocument();
    });

    it('renders a default themed style', () => {
      render(RoomBoardNote, {
        propsData: {
          myId: 'me',
          note: buildNoteViewModel(),
          moving: false,
          editable: true,
        },
      });

      expect(screen.getByRole('listitem')).toHaveStyle(`
      --theme-primary-colour: ${LIGHT_CYAN};
      --theme-text-colour: ${BLACKEST_BLACK};
    `);
    });

    it('renders the default themed style if the style is invalid', () => {
      render(RoomBoardNote, {
        propsData: {
          myId: 'me',
          note: buildNoteViewModel({ style: 100 }),
          moving: false,
          editable: true,
        },
      });

      expect(screen.getByRole('listitem')).toHaveStyle(`
      --theme-primary-colour: ${LIGHT_CYAN};
      --theme-text-colour: ${BLACKEST_BLACK};
    `);
    });
  });

  describe('moving', () => {
    describe('touch not enabled', () => {
      it('does not fire anything when clicking with a pointer if touch is not enabled', async () => {
        (supportsTouchEvents as jest.Mock).mockReturnValue(false);
        const { emitted } = render(RoomBoardNote, {
          propsData: {
            myId: 'me',
            note: buildNoteViewModel({ id: 'note123', posX: 2, posY: 1 }),
            moving: true,
            editable: true,
          },
        });

        await fireEvent(
          screen.getByRole('listitem'),
          new PointerDownEvent({ pointerId: 1000 })
        );

        expect(emitted().pointerheld).toBeUndefined();
      });
      it('fires a pointerheld event for a mouse click when touch is not enabled', async () => {
        (supportsTouchEvents as jest.Mock).mockReturnValue(false);
        const { emitted } = render(RoomBoardNote, {
          propsData: {
            myId: 'me',
            note: buildNoteViewModel({ id: 'note123', posX: 2, posY: 1 }),
            moving: true,
            editable: true,
          },
        });

        await userEvent.click(screen.getByRole('listitem'), {
          button: MOUSE_BUTTONS.primary,
        });

        expect(emitted().pointerheld).not.toBeUndefined();
        expect(emitted().pointerheld[0]).toEqual([
          {
            pointerId: 1,
            noteId: 'note123',
          },
        ]);
      });
      it('does not fire the pointerheld event for a mouse click which is not the primary button', async () => {
        const { emitted } = render(RoomBoardNote, {
          propsData: {
            myId: 'me',
            note: buildNoteViewModel(),
            editable: true,
          },
        });

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
      it('fires a pointerheld event when clicking with a pointer', async () => {
        (supportsTouchEvents as jest.Mock).mockReturnValue(true);
        const { emitted } = render(RoomBoardNote, {
          propsData: {
            myId: 'me',
            note: buildNoteViewModel({
              id: 'note123',
              posX: 2,
              posY: 1,
              lockedBy: null,
            }),
            moving: true,
            editable: true,
          },
        });

        await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());

        expect(emitted().pointerheld).not.toBeUndefined();
        expect(emitted().pointerheld[0]).toEqual([
          {
            pointerId: 1,
            noteId: 'note123',
          },
        ]);
      });
      it('fires nothing for a mouse click when touch is enabled', async () => {
        (supportsTouchEvents as jest.Mock).mockReturnValue(true);
        const { emitted } = render(RoomBoardNote, {
          propsData: {
            myId: 'me',
            note: buildNoteViewModel({
              id: 'note123',
              posX: 2,
              posY: 1,
              lockedBy: null,
            }),
            moving: true,
            editable: true,
          },
        });

        await fireEvent.mouseDown(screen.getByRole('listitem'));

        expect(emitted().pointerheld).toBeUndefined();
      });
    });

    it('fires a pointerheld event when the note is locked by me', async () => {
      const { emitted } = render(RoomBoardNote, {
        propsData: {
          myId: 'me',
          note: buildNoteViewModel({ lockedBy: 'me' }),
          moving: true,
          editable: true,
        },
      });

      await fireEvent(
        screen.getByRole('listitem'),
        new PointerDownEvent({ pointerId: 1000 })
      );

      expect(emitted().pointerheld).not.toBeUndefined();
    });
    it('does not fire the pointerheld event when the note is locked by someone else', async () => {
      const { emitted } = render(RoomBoardNote, {
        propsData: {
          myId: 'me',
          note: buildNoteViewModel({ lockedBy: 'someone' }),
          moving: true,
          editable: true,
        },
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
      const { queryMocks } = renderWithApollo(
        RoomBoardNote,
        [
          makeHappyUpdateBoardNoteStyleMutationStub({
            id: 'note123',
            style: 3,
          }),
        ],
        {
          propsData: {
            myId: 'me',
            note: buildNoteViewModel({
              id: 'note123',
              posX: 2,
              posY: 1,
            }),
            editable: true,
            moving: false,
          },
          mocks: {
            $toasted: { global: { apollo_error: jest.fn() } },
          },
        }
      );

      await userEvent.dblClick(screen.getByRole('listitem'));
      await userEvent.click(screen.getByRole('radio', { name: /style-3/i }));

      expect(screen.getByRole('listitem')).toHaveStyle(`
      --theme-primary-colour: ${LIGHT_ORANGE};
      --theme-text-colour: ${BLACKEST_BLACK};
    `);

      await waitFor(() =>
        expect(queryMocks[0]).toHaveBeenCalledWith({
          input: { id: 'note123', style: 2 },
        })
      );
    });
    it('displays a toast update when an error occurs while updating style', async () => {
      const { mocks } = renderWithApollo(
        RoomBoardNote,
        [
          makeSadUpdateBoardNoteStyleMutationStub({
            id: 'note123',
            style: 3,
          }),
        ],
        {
          propsData: {
            myId: 'me',
            editable: true,
            note: buildNoteViewModel({
              id: 'note123',
              posX: 2,
              posY: 1,
              text: 'some text',
            }),
          },
          mocks: {
            $toasted: { global: { apollo_error: jest.fn() } },
            $logger: { error: jest.fn() },
          },
        }
      );

      await userEvent.dblClick(screen.getByRole('listitem'));
      await userEvent.click(screen.getByRole('radio', { name: /style-3/i }));
      await sleep(5);

      expect(mocks.$toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not save note style changes: GraphQL error: everything is broken'
      );
      expect(mocks.$logger.error).toHaveBeenCalled();
    });

    it('sends an editing event when I double click', async () => {
      const { emitted } = render(RoomBoardNote, {
        propsData: {
          myId: 'me',
          note: buildNoteViewModel({
            id: 'note123',
            posX: 2,
            posY: 1,
            text: 'some text',
          }),
          editable: true,
        },
      });

      await userEvent.dblClick(screen.getByRole('listitem'));
      expect(emitted().editstart).not.toBeUndefined();
      expect(emitted().editstart[0]).toEqual(['note123']);
    });

    it('does not edit if the note is not editable', async () => {
      const { emitted } = render(RoomBoardNote, {
        propsData: {
          myId: 'me',
          note: buildNoteViewModel({
            id: 'note123',
            posX: 2,
            posY: 1,
            text: 'some text',
          }),
          editable: false,
        },
      });

      await userEvent.dblClick(screen.getByRole('listitem'));
      expect(emitted().editstart).toBeUndefined();
    });

    it('sends an update when I save while editing', async () => {
      const noteId = 'note123';
      const updatedText = 'updated content';
      const { queryMocks } = renderWithApollo(
        RoomBoardNote,
        [
          makeHappyUpdateBoardNoteTextMutationStub({
            id: noteId,
            text: updatedText,
          }),
        ],
        {
          propsData: {
            myId: 'me',
            note: buildNoteViewModel({
              id: noteId,
              posX: 2,
              posY: 1,
              text: 'some text',
            }),
            editable: true,
          },
          mocks: {
            $toasted: { global: { apollo_error: jest.fn() } },
          },
        }
      );

      await editTextAndSave(updatedText);
      await screen.findByText(updatedText);
      expect(queryMocks[0]).toHaveBeenCalledWith({
        input: { id: noteId, text: updatedText },
      });
    });

    it('reverts to the original text when an error occurs while updating', async () => {
      const updatedText = 'updated content';
      const noteId = 'note123';
      renderWithApollo(
        RoomBoardNote,
        [
          makeSadUpdateRoomBoardNoteMutationStub({
            id: noteId,
            text: updatedText,
          }),
        ],
        {
          propsData: {
            myId: 'me',
            editable: true,
            note: buildNoteViewModel({
              id: noteId,
              text: 'original text',
            }),
          },
          mocks: {
            $toasted: { global: { apollo_error: jest.fn() } },
            $logger: { error: jest.fn() },
          },
        }
      );

      await editTextAndSave(updatedText);

      expect(await screen.findByText('original text')).toBeInTheDocument();
    });

    it('displays a toast update when an error occurs while updating', async () => {
      const updatedText = 'updated content';
      const noteId = 'note123';
      const { mocks } = renderWithApollo(
        RoomBoardNote,
        [
          makeSadUpdateRoomBoardNoteMutationStub({
            id: noteId,
            text: updatedText,
          }),
        ],
        {
          propsData: {
            myId: 'me',
            editable: true,
            note: buildNoteViewModel({
              id: noteId,
              posX: 2,
              posY: 1,
              text: 'some text',
            }),
          },
          mocks: {
            $toasted: { global: { apollo_error: jest.fn() } },
            $logger: { error: jest.fn() },
          },
        }
      );

      await editTextAndSave(updatedText);
      await sleep(5);

      expect(mocks.$toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not save note changes: GraphQL error: everything is broken'
      );
      expect(mocks.$logger.error).toHaveBeenCalled();
    });

    it('lets me delete while editing', async () => {
      const noteId = 'note123';

      const { queryMocks } = renderWithApollo(
        RoomBoardNote,
        [
          makeHappyDeleteBoardNoteMutationStub({
            id: noteId,
          }),
        ],
        {
          propsData: {
            myId: 'me',
            note: buildNoteViewModel({
              id: noteId,
              posX: 2,
              posY: 1,
              text: 'some text',
            }),
            editable: true,
          },
          mocks: {
            $toasted: { global: { apollo_error: jest.fn() } },
          },
        }
      );

      await userEvent.dblClick(screen.getByRole('listitem'));
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() =>
        expect(queryMocks[0]).toHaveBeenCalledWith({ id: noteId })
      );
    });
    it('displays a toast update when an error occurs while deleting', async () => {
      const noteId = 'note123';

      const { mocks } = renderWithApollo(
        RoomBoardNote,
        [
          makeSadDeleteBoardNoteMutationStub({
            id: noteId,
          }),
        ],
        {
          propsData: {
            myId: 'me',
            note: buildNoteViewModel({
              id: noteId,
              posX: 2,
              posY: 1,
              text: 'some text',
            }),
            editable: true,
          },
          mocks: {
            $toasted: {
              global: {
                apollo_error: jest.fn(),
              },
            },
            $logger: {
              error: jest.fn(),
            },
          },
        }
      );

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
