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
import { buildNoteViewModel } from '@/testHelpers/testData';
import userEvent from '@testing-library/user-event';
import {
  NOTE_ID,
  makeHappyLockRoomBoardNoteMutationStub,
  makeHappyMoveBoardNoteMutationStub,
  makeHappyUnlockRoomBoardNoteMutationStub,
  makeHappyUpdateBoardNoteTextMutationStub,
  makeSadLockRoomBoardNoteMutationStub,
  makeSadMoveBoardNoteMutationStub,
  makeSadUnlockRoomBoardNoteMutationStub,
  MY_ID,
  ROOM_ID,
} from '@/testHelpers/noteQueryStubs';

import { supportsTouchEvents } from '@/common/dom';
import { sleep } from '@/testHelpers/timeout';
import { NoteViewModel } from '@/components/Room/Board/notes';
import { Vue } from 'vue/types/vue';

jest.mock('@/common/dom');
(supportsTouchEvents as jest.Mock).mockReturnValue(true);

interface RoomBoardComponentProps {
  myId: string;
  roomId: string;
  zoomFactor: number;
  notes: NoteViewModel[];
}

const renderComponent = (
  props: Partial<RoomBoardComponentProps> = {},
  queries: QuerySpec[] = [],
  mocks: Partial<{
    $toasted: typeof Vue.prototype.$toasted;
    $logger: typeof Vue.prototype.$logger;
  }> = {}
) => {
  return renderWithApollo(RoomBoard, queries, {
    propsData: {
      myId: MY_ID,
      zoomFactor: 1,
      roomId: ROOM_ID,
      notes: [buildNoteViewModel({ id: NOTE_ID, posX: 10, posY: 10 })],
      ...props,
    },
    mocks: {
      $toasted: {
        global: {
          apollo_error: jest.fn(),
        },
      },
      ...mocks,
    },
  });
};

describe('<room-board />', () => {
  it('renders a note defaulting at 10px by 10px', () => {
    renderComponent();

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  10px;
      left: 10px;
    `);
  });
  it('rerenders notes when the props change', async () => {
    const { updateProps } = renderComponent(
      {
        notes: [buildNoteViewModel({ id: NOTE_ID, posX: 10, posY: 10 })],
      },
      [makeHappyMoveBoardNoteMutationStub()]
    );

    expect(screen.getByRole('listitem')).toHaveStyle(`top:  10px; left: 10px;`);

    await updateProps({
      notes: [buildNoteViewModel({ id: NOTE_ID, posX: 20, posY: 20 })],
    });

    expect(screen.getByRole('listitem')).toHaveStyle(`top:  20px; left: 20px;`);
  });
  describe('when editing a note', () => {
    it('lets me edit a note', async () => {
      renderComponent();

      await userEvent.dblClick(screen.getByRole('listitem'));

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    it('does not let me edit a note if I am already editing one', async () => {
      renderComponent({
        notes: [
          buildNoteViewModel({ id: 'NOTE_1' }),
          buildNoteViewModel({ id: 'NOTE_2' }),
        ],
      });

      const notes = screen.getAllByRole('listitem');
      await userEvent.dblClick(notes[0]);
      expect(screen.getAllByRole('textbox')).toHaveLength(1);
      await userEvent.dblClick(notes[1]);
      expect(screen.getAllByRole('textbox')).toHaveLength(1);
    });
    it('lets me edit different notes in sequence', async () => {
      renderComponent(
        {
          notes: [
            buildNoteViewModel({ id: 'NOTE_1' }),
            buildNoteViewModel({ id: 'NOTE_2' }),
          ],
        },
        [
          makeHappyUpdateBoardNoteTextMutationStub({
            id: 'NOTE_1',
            text: 'placeholder text',
          }),
        ]
      );

      const notes = screen.getAllByRole('listitem');
      await userEvent.dblClick(notes[0]);
      expect(screen.getAllByRole('textbox')).toHaveLength(1);
      await userEvent.click(screen.getByRole('button', { name: /save/i }));
      expect(screen.queryAllByRole('textbox')).toHaveLength(0);
      await userEvent.dblClick(notes[1]);
      expect(screen.getAllByRole('textbox')).toHaveLength(1);
    });
  });
  describe('when moving', () => {
    async function moveNote() {
      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());
      await fireEvent(
        screen.getByLabelText('board'),
        new PointerMoveEvent({
          movementX: 20,
          movementY: 10,
        })
      );
    }

    it('locks the note', async () => {
      const { queryMocks } = renderComponent(
        {
          notes: [buildNoteViewModel({ id: NOTE_ID })],
        },
        [makeHappyLockRoomBoardNoteMutationStub({ id: NOTE_ID })]
      );

      await moveNote();

      //Best I can do for style atm since vue-jest / jsdom do not support style tags
      expect(screen.getByRole('listitem')).toHaveAttribute('data-moving');
      expect(queryMocks[0]).toHaveBeenCalledWith({
        input: { lockedBy: MY_ID, id: NOTE_ID },
      });
    });
    it('updates the position', async () => {
      renderComponent(
        {
          notes: [buildNoteViewModel({ id: NOTE_ID, posX: 10, posY: 10 })],
        },
        [makeHappyLockRoomBoardNoteMutationStub({ id: NOTE_ID })]
      );
      await moveNote();

      expect(screen.getByRole('listitem')).toHaveStyle(`
        top:  20px;
        left: 30px;
      `);
    });
    it('allows moving a locked note if i locked it', async () => {
      const { queryMocks } = renderComponent(
        {
          notes: [
            buildNoteViewModel({
              id: NOTE_ID,
              posX: 10,
              posY: 10,
              lockedBy: MY_ID,
            }),
          ],
        },
        [makeHappyLockRoomBoardNoteMutationStub()]
      );

      const note = screen.getByRole('listitem');
      await moveNote();

      expect(note).toHaveStyle('top:  20px; left: 30px;');
      expect(queryMocks[0]).toHaveBeenCalledWith({
        input: {
          lockedBy: MY_ID,
          id: NOTE_ID,
        },
      });
    });
    it('does not move the note if it has been locked by somebody else', async () => {
      await renderComponent({
        notes: [
          buildNoteViewModel({
            id: NOTE_ID,
            posX: 10,
            posY: 10,
            lockedBy: 'someone-else',
          }),
        ],
      });

      const note = screen.getByRole('listitem');
      await fireEvent(note, new PointerDownEvent());
      await fireEvent(
        note,
        new PointerMoveEvent({ movementX: 20, movementY: 10 })
      );

      expect(note).toHaveStyle('top: 10px; left: 10px;');
    });
    it('displays a toast update when an error occurs while locking', async () => {
      const $logger = {
        error: jest.fn(),
      };

      const { mocks } = renderComponent(
        {
          notes: [buildNoteViewModel({ id: NOTE_ID })],
        },
        [makeSadLockRoomBoardNoteMutationStub({ id: NOTE_ID })],
        { $logger }
      );

      await moveNote();
      await sleep(5);

      expect(mocks.$toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not move the note: GraphQL error: everything is broken'
      );
      expect(mocks.$logger?.error).toHaveBeenCalled();
    });
    it('unlocks after moving', async () => {
      const { queryMocks } = await renderComponent(
        {
          notes: [buildNoteViewModel({ id: NOTE_ID })],
        },
        [
          makeHappyLockRoomBoardNoteMutationStub({ id: NOTE_ID }),
          makeHappyUnlockRoomBoardNoteMutationStub({ id: NOTE_ID }),
          makeHappyMoveBoardNoteMutationStub({ id: NOTE_ID }),
        ]
      );
      await moveNote();
      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());

      await waitFor(() => {
        return expect(queryMocks[1]).toHaveBeenCalledWith({
          input: { id: NOTE_ID },
        });
      });

      expect(screen.getByRole('listitem')).not.toHaveAttribute('data-moving');
    });
    it('forgets about saving if the note was removed while moving', async () => {
      const { queryMocks, updateProps } = await renderComponent(
        {
          notes: [buildNoteViewModel({ id: NOTE_ID })],
        },
        [
          makeHappyLockRoomBoardNoteMutationStub({ id: NOTE_ID }),
          makeHappyUnlockRoomBoardNoteMutationStub({ id: NOTE_ID }),
          makeHappyMoveBoardNoteMutationStub({ id: NOTE_ID }),
        ]
      );

      await fireEvent(screen.getByRole('listitem'), new PointerDownEvent());
      await fireEvent(
        screen.getByRole('listitem'),
        new PointerMoveEvent({
          movementX: 20,
          movementY: 10,
        })
      );

      await updateProps({ notes: [] });

      await fireEvent(screen.getByLabelText('board'), new PointerUpEvent());

      await sleep(5);

      expect(queryMocks[1]).not.toHaveBeenCalled();
      expect(queryMocks[2]).not.toHaveBeenCalled();
    });

    it('remotely updates the note position', async () => {
      const { queryMocks } = await renderComponent(
        {
          notes: [buildNoteViewModel({ id: NOTE_ID, posY: 10, posX: 10 })],
        },
        [
          makeHappyLockRoomBoardNoteMutationStub({ id: NOTE_ID }),
          makeHappyUnlockRoomBoardNoteMutationStub({ id: NOTE_ID }),
          makeHappyMoveBoardNoteMutationStub({ id: NOTE_ID }),
        ]
      );
      const note = screen.getByRole('listitem');
      await moveNote();
      await fireEvent(note, new PointerUpEvent());

      expect(queryMocks[2]).toHaveBeenCalledWith({
        input: { id: NOTE_ID, posX: 30, posY: 20 },
      });
    });
    it('displays a toast update when an error occurs while unlocking', async () => {
      const { mocks } = renderComponent(
        {
          notes: [buildNoteViewModel({ id: NOTE_ID, posX: 10, posY: 10 })],
        },
        [
          makeHappyLockRoomBoardNoteMutationStub(),
          makeSadUnlockRoomBoardNoteMutationStub(),
          makeHappyMoveBoardNoteMutationStub(),
        ]
      );

      await moveNote();
      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());
      await sleep(5);

      expect(mocks.$toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not update the note: GraphQL error: everything is broken'
      );
    });
    it('displays a toast update when an error occurs while mutating the position', async () => {
      const { mocks } = renderComponent(
        {
          notes: [buildNoteViewModel()],
        },
        [
          makeHappyLockRoomBoardNoteMutationStub(),
          makeHappyUnlockRoomBoardNoteMutationStub(),
          makeSadMoveBoardNoteMutationStub(),
        ]
      );

      await moveNote();
      await fireEvent(screen.getByRole('listitem'), new PointerUpEvent());
      await sleep(5);

      expect(mocks.$toasted.global.apollo_error).toHaveBeenCalledWith(
        'Could not update the note: GraphQL error: everything is broken'
      );
    });
  });
});
