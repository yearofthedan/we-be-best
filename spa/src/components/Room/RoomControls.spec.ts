import { render, renderWithApollo, screen } from '@/testHelpers/renderer';
import userEvent from '@testing-library/user-event';
import RoomControls from '@/components/Room/RoomControls.vue';
import {
  buildMemberViewModel,
  buildNoteViewModel,
} from '@/testHelpers/viewModelBuilders';
import { BACKGROUND_OPTIONS } from '@/components/Room/roomStyle';
import {
  makeHappyAddRoomBoardNoteMutationStub,
  makeSadAddRoomBoardNoteMutationStub,
} from '@/testHelpers/noteQueryStubs';
import { sleep } from '@/testHelpers/timeout';
import { v4 } from 'uuid';

jest.mock('uuid');

describe('<room-controls />', () => {
  it('lets me download all the data', async () => {
    render(RoomControls, {
      propsData: {
        notes: { NOTE123: buildNoteViewModel() },
        members: [buildMemberViewModel()],
        roomId: 'ROOMID1',
        background: BACKGROUND_OPTIONS.BLANK,
      },
    });

    const link = screen.getByRole('link', { name: /download data/i });
    await userEvent.click(link);

    const href =
      'data:text/json;charset=utf-8,%7B%22room%22%3A%7B%22id%22%3A%22ROOMID1%22%2C%22members%22%3A%5B%7B%22id%22%3A%22MEMBER123%22%2C%22name%22%3A%22my%20mum%22%7D%5D%2C%22notesData%22%3A%5B%7B%22id%22%3A%22NOTE123%22%2C%22posY%22%3A20%2C%22posX%22%3A30%2C%22text%22%3A%22placeholder%20text%22%2C%22style%22%3A0%7D%5D%7D%7D';

    expect(link).toHaveAttribute('href', href);
  });

  it('lets me copy the room url for sharing', async () => {
    // @ts-ignore
    const clipboard = (global.navigator.clipboard = { writeText: jest.fn() });

    render(RoomControls, {
      propsData: {
        notes: {},
        members: [],
        roomId: 'ROOMID1',
        background: BACKGROUND_OPTIONS.BLANK,
      },
    });

    await userEvent.click(
      screen.getByRole('button', { name: /copy room link/i })
    );
    expect(clipboard.writeText).toHaveBeenCalledWith('localhost/?room=ROOMID1');
  });

  it('lets me add a note', async () => {
    (v4 as jest.Mock).mockReturnValue('11111-11111-1111-1111');

    const { queryMocks } = renderWithApollo(
      RoomControls,
      makeHappyAddRoomBoardNoteMutationStub({
        noteId: '11111-11111-1111-1111',
      }),
      {
        propsData: {
          notes: {},
          members: [],
          roomId: 'ROOM123',
          background: BACKGROUND_OPTIONS.BLANK,
        },
        mocks: { $toasted: { show: jest.fn() } },
      }
    );

    await userEvent.click(await screen.findByRole('button', { name: /add/i }));

    expect(queryMocks[0]).toHaveBeenCalledWith({
      input: {
        noteId: '11111-11111-1111-1111',
        roomId: 'ROOM123',
      },
    });
  });

  it('displays a toast when an error occurs while adding', async () => {
    (v4 as jest.Mock).mockReturnValue('11111-11111-1111-1111');

    const { mocks } = renderWithApollo(
      RoomControls,
      makeSadAddRoomBoardNoteMutationStub(),
      {
        propsData: {
          notes: {},
          members: [],
          roomId: 'ROOM123',
          background: BACKGROUND_OPTIONS.BLANK,
        },
        mocks: {
          $toasted: { global: { apollo_error: jest.fn() } },
          $logger: { error: jest.fn() },
        },
      }
    );

    await userEvent.click(await screen.findByRole('button', { name: /add/i }));
    await sleep(5);

    expect(mocks.$toasted.global.apollo_error).toHaveBeenCalledWith(
      'Could not add note: GraphQL error: everything is broken'
    );
    expect(mocks.$logger.error).toHaveBeenCalled();
  });
});
