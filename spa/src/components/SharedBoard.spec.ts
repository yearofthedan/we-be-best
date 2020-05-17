import {fireEvent, render, screen} from '@testing-library/vue';
import SharedBoard from '@/components/SharedBoard.vue';
import {MouseMoveEvent} from '@/testHelpers/jsdomFriendlyMouseEvents';

describe('<shared-board />', () => {
  it('renders a note defaulting at 10px by 10px and lets me move it around', () => {
    render(SharedBoard);

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  10px;
      left: 10px;
    `);
  });

  it('lets me move a note around', async () => {
    render(SharedBoard);

    await fireEvent.mouseDown(screen.getByRole('listitem'));
    await fireEvent(screen.getByRole('listitem'),
      new MouseMoveEvent({
        movementX: 20,
        movementY: 10
      }));

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  20px;
      left: 30px;
    `);
  });
});
