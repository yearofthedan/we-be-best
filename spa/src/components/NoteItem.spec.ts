import {fireEvent, render, screen} from '@testing-library/vue';
import NoteItem from '@/components/NoteItem.vue';
import {MouseMoveEvent} from '@/testHelpers/jsdomFriendlyMouseEvents';

describe('<note-item />', () => {
  it('renders the positioning based upon the x and y props', () => {
    render(NoteItem, {
      propsData: {
        id: 'note123',
        xPos: 2,
        yPos: 1,
        moving: false,
      }
    });

    expect(screen.getByRole('listitem')).toHaveStyle(`
      top:  1px;
      left: 2px;
    `);
  });

  it('fires a board change event when starting to move the item', async () => {
    const {emitted} = render(NoteItem, {
      propsData: {
        id: 'note123',
        xPos: 2,
        yPos: 1,
        moving: false,
      }
    });

    await fireEvent.mouseDown(screen.getByRole('listitem'));

    expect(emitted().boardchange).not.toBeUndefined();
    expect(emitted().boardchange[0]).toEqual([ {
      "id": "note123",
      "moving": true,
      "xPos": 2,
      "yPos": 1
    }]);
  });

  it('fires a board change event when stopping moving the item', async () => {
    const {emitted} = render(NoteItem, {
      propsData: {
        id: 'note123',
        xPos: 2,
        yPos: 1,
        moving: true,
      }
    });

    await fireEvent.mouseUp(screen.getByRole('listitem'));

    expect(emitted().boardchange).not.toBeUndefined();
    expect(emitted().boardchange[0]).toEqual([ {
      "id": "note123",
      "moving": false,
      "xPos": 2,
      "yPos": 1
    }]);
  });

  it('fires a board change event when moving the item', async () => {
    const {emitted} = render(NoteItem, {
      propsData: {
        id: 'note123',
        xPos: 2,
        yPos: 1,
        moving: true,
      }
    });

    await fireEvent(screen.getByRole('listitem'),
      new MouseMoveEvent({
        movementX: 20,
        movementY: 10
      }));

    expect(emitted().boardchange).not.toBeUndefined();
    expect(emitted().boardchange[0]).toEqual([ {
      "id": "note123",
      "moving": true,
      "xPos": 22,
      "yPos": 11
    }]);
  });

  it('does not fire an event when moving the item if not selected', async () => {
    const {emitted} = render(NoteItem, {
      propsData: {
        id: 'note123',
        xPos: 2,
        yPos: 1,
        moving: false,
      }
    });

    await fireEvent.mouseMove(screen.getByRole('listitem'), {
      movementX: 20,
      movementY: 10
    });

    expect(emitted().boardchange).toBeUndefined();
  });
});
