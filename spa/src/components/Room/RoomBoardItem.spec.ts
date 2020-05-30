import { fireEvent, render, screen } from '@/testHelpers/renderer';
import RoomBoardItem from '@/components/Room/RoomBoardItem.vue';
import { PointerDownEvent } from '@/testHelpers/jsdomFriendlyPointerEvents';

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

  it('fires an interaction start event when clicking on the item', async () => {
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

    expect(emitted().interactionstart).not.toBeUndefined();
    expect(emitted().interactionstart[0]).toEqual([
      {
        action: 'MOVING',
        interactionId: 1000,
        itemId: 'item123',
      },
    ]);
  });
});
