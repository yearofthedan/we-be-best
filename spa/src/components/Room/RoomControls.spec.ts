import { render, screen } from '@/testHelpers/renderer';
import userEvent from '@testing-library/user-event';
import RoomControls from '@/components/Room/RoomControls.vue';
import {
  buildMemberViewModel,
  buildNoteViewModel,
} from '@/testHelpers/viewModelBuilders';
import { BACKGROUND_OPTIONS } from '@/components/Room/roomStyle';

describe('<room-controls />', () => {
  it('lets me download all the data', async () => {
    render(RoomControls, {
      propsData: {
        notes: [buildNoteViewModel()],
        members: [buildMemberViewModel()],
        roomId: 'ROOMID1',
        background: BACKGROUND_OPTIONS.BLANK,
      },
    });

    const link = screen.getByRole('link', { name: /download data/i });
    await userEvent.click(link);

    const href =
      'data:text/json;charset=utf-8,%7B%22room%22%3A%7B%22id%22%3A%22ROOMID1%22%2C%22members%22%3A%5B%7B%22id%22%3A%22MEMBER123%22%2C%22name%22%3A%22my%20mum%22%7D%5D%2C%22notes%22%3A%5B%7B%22id%22%3A%22NOTE123%22%2C%22lockedBy%22%3A%22me%22%2C%22posY%22%3A20%2C%22posX%22%3A30%2C%22text%22%3A%22placeholder%20text%22%2C%22style%22%3Anull%7D%5D%7D%7D';
    expect(link).toHaveAttribute('href', href);
  });

  it('lets me copy the room url for sharing', async () => {
    // @ts-ignore
    const clipboard = (global.navigator.clipboard = { writeText: jest.fn() });

    render(RoomControls, {
      propsData: {
        notes: [],
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
});
