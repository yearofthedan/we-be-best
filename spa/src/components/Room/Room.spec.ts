import Room from '@/components/Room/Room.vue';
import { renderWithApollo, screen } from '@/testHelpers/renderer';
import {
  makeHappyRoomItemUpdatesSubscription,
  makeHappyRoomQueryStub,
  makeHappyRoomMemberUpdateSubscription,
} from '@/testHelpers/roomQueryStubs';
import { buildItemResponse } from '@/testHelpers/itemQueryStubs';

describe('<room />', () => {
  it('renders the members in the room', async () => {
    renderWithApollo(
      Room,
      [
        makeHappyRoomQueryStub(),
        makeHappyRoomMemberUpdateSubscription(),
        makeHappyRoomItemUpdatesSubscription(),
      ],
      {
        propsData: { roomId: '123', myId: 'me' },
      }
    );

    expect(await screen.findByText(/me/)).toBeInTheDocument();
    expect(screen.getByText(/my-mother/)).toBeInTheDocument();
  });

  it('renders the initial and updated items on the board', async () => {
    const item = buildItemResponse({
      id: 'ITEM1',
      text: 'item-text',
      style: null,
    });
    const itemToBeUpdated = buildItemResponse({
      id: 'ITEM2',
      text: 'item-text',
      style: 2,
    });

    renderWithApollo(
      Room,
      [
        makeHappyRoomQueryStub({
          successData: { items: [item, itemToBeUpdated] },
        }),
        makeHappyRoomMemberUpdateSubscription(),
        makeHappyRoomItemUpdatesSubscription({
          successData: { ...itemToBeUpdated, text: 'more-item-text' },
        }),
      ],
      {
        propsData: { roomId: '123', myId: 'me' },
      }
    );

    expect(await screen.findByText('item-text')).toBeInTheDocument();
    expect(await screen.findByText('more-item-text')).toBeInTheDocument();
  });
});
