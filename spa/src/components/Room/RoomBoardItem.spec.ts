import { fireEvent, render, screen } from '@/testHelpers/renderer';
import RoomBoardItem from '@/components/Room/RoomBoardItem.vue';
import { PointerMoveEvent } from '@/testHelpers/jsdomFriendlyPointerEvents';

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

  it('fires a room board change event when starting to move the item', async () => {
    const { emitted } = render(RoomBoardItem, {
      propsData: {
        id: 'item123',
        posX: 2,
        posY: 1,
        moving: false,
      },
    });

    await fireEvent.pointerDown(screen.getByRole('listitem'));

    expect(emitted().roomboardchange).not.toBeUndefined();
    expect(emitted().roomboardchange[0]).toEqual([
      {
        id: 'item123',
        moving: true,
        posX: 2,
        posY: 1,
      },
    ]);
  });

  it('fires a room board change event when stopping moving the item', async () => {
    const { emitted } = render(RoomBoardItem, {
      propsData: {
        id: 'item123',
        posX: 2,
        posY: 1,
        moving: true,
      },
    });

    await fireEvent.pointerUp(screen.getByRole('listitem'));

    expect(emitted().roomboardchange).not.toBeUndefined();
    expect(emitted().roomboardchange[0]).toEqual([
      {
        id: 'item123',
        moving: false,
        posX: 2,
        posY: 1,
      },
    ]);
  });

  it('fires a room board change event when moving the item', async () => {
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
      new PointerMoveEvent({
        movementX: 20,
        movementY: 10,
      })
    );

    expect(emitted().roomboardchange).not.toBeUndefined();
    expect(emitted().roomboardchange[0]).toEqual([
      {
        id: 'item123',
        moving: true,
        posX: 22,
        posY: 11,
      },
    ]);
  });

  it('does not fire an event when moving the item if not selected', async () => {
    const { emitted } = render(RoomBoardItem, {
      propsData: {
        id: 'item123',
        posX: 2,
        posY: 1,
        moving: false,
      },
    });

    await fireEvent.pointerMove(screen.getByRole('listitem'), {
      movementX: 20,
      movementY: 10,
    });

    expect(emitted().roomboardchange).toBeUndefined();
  });
});
