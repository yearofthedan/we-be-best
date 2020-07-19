import Room from '@/components/Room/Room.vue';
import { QuerySpec, renderWithApollo, screen } from '@/testHelpers/renderer';
import {
  makeHappyRoomNoteUpdatesSubscription,
  makeHappyRoomMemberUpdateSubscription,
  makeHappyRoomQueryStub,
} from '@/testHelpers/roomQueryStubs';
import {
  buildNoteResponse,
  makeHappyAddRoomBoardNoteMutationStub,
  makeSadAddRoomBoardNoteMutationStub,
  MY_ID,
  ROOM_ID,
} from '@/testHelpers/noteQueryStubs';
import userEvent from '@testing-library/user-event';
import { DEFAULT_X, DEFAULT_Y } from '@/components/Room/Board/notes';
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
      makeHappyRoomNoteUpdatesSubscription(),
      makeHappyAddRoomBoardNoteMutationStub(),
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
        makeHappyRoomNoteUpdatesSubscription(),
      ],
      {
        propsData: { roomId: '123', myId: 'me' },
      }
    );

    expect(await screen.findByText(/me/)).toBeInTheDocument();
    expect(screen.getByText(/my-mother/)).toBeInTheDocument();
  });

  it('renders the initial and updated notes on the board', async () => {
    const note = buildNoteResponse({
      id: 'NOTE1',
      text: 'note-text',
      style: null,
    });
    const noteToBeUpdated = buildNoteResponse({
      id: 'NOTE2',
      text: 'note-text',
      style: 2,
    });

    renderWithApollo(
      Room,
      [
        makeHappyRoomQueryStub({
          successData: { notes: [note, noteToBeUpdated] },
        }),
        makeHappyRoomMemberUpdateSubscription(),
        makeHappyRoomNoteUpdatesSubscription({
          successData: { ...noteToBeUpdated, text: 'more-note-text' },
        }),
      ],
      {
        propsData: { roomId: '123', myId: 'me' },
      }
    );

    expect(await screen.findByText('note-text')).toBeInTheDocument();
    expect(await screen.findByText('more-note-text')).toBeInTheDocument();
  });
  it('does not render deleted notes on the board', async () => {
    const note = buildNoteResponse({
      id: 'NOTE1',
      text: 'note-text',
      style: null,
    });
    const noteToBeDeleted = buildNoteResponse({
      id: 'NOTE2',
      text: 'note-deleted-text',
      isDeleted: false,
    });

    await renderComponent(undefined, [
      makeHappyRoomQueryStub({
        successData: { notes: [note, noteToBeDeleted] },
      }),
      makeHappyRoomMemberUpdateSubscription(),
      makeHappyRoomNoteUpdatesSubscription({
        successData: { ...noteToBeDeleted, isDeleted: true },
      }),
    ]);

    expect(await screen.getByText('note-text')).toBeInTheDocument();
    expect(
      await screen.queryByText('note-deleted-text')
    ).not.toBeInTheDocument();
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

  describe('when adding a note', () => {
    it('lets me add a note', async () => {
      const { queryMocks } = await renderComponent();

      await screen.findByRole('button', { name: /add/i });
      await userEvent.click(screen.getByRole('button', { name: /add/i }));

      await waitFor(() =>
        expect(queryMocks[3]).toHaveBeenCalledWith({
          input: {
            roomId: '123',
            noteId: expect.any(String),
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
            successData: { notes: [] },
          }),
          makeHappyRoomMemberUpdateSubscription(),
          makeHappyRoomNoteUpdatesSubscription(),
          makeSadAddRoomBoardNoteMutationStub(),
        ],
        {
          propsData: { myId: MY_ID, roomId: ROOM_ID, notes: [] },
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
        'Could not add a new note: GraphQL error: everything is broken'
      );
      expect($logger.error).toHaveBeenCalled();
    });
  });
});
