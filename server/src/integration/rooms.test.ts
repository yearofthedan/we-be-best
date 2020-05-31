import {createTestClient} from 'apollo-server-testing';
import server from '../apolloServer';
import {
  GET_ROOM_QUERY,
  JOIN_ROOM_MUTATION,
  LOCK_ROOM_BOARD_ITEM_MUTATION, UNLOCK_ROOM_BOARD_ITEM_MUTATION,
} from '../../../spa/src/components/Room/roomGraphQLQuery';

const { query } = createTestClient(server());

describe('integration: rooms', () => {
  it('locks an item', async () => {
    const res = await query({
      query: LOCK_ROOM_BOARD_ITEM_MUTATION,
      variables: {
        input: {
          roomId: '123',
          itemId: 'item1',
          meId: 'me',
        },
      },
    });

    expect(res.data).toHaveProperty('lockRoomBoardItem', {
      id: '123',
      items: [{
        id: 'item1',
        lockedBy: 'me',
        posX: 0,
        posY: 0
      }]
    });
  });

  it('unlocks an item', async () => {
    await query({
      query: LOCK_ROOM_BOARD_ITEM_MUTATION,
      variables: {
        input: {
          roomId: '123',
          itemId: 'item1',
          meId: 'me',
        },
      },
    });

    const res = await query({
      query: UNLOCK_ROOM_BOARD_ITEM_MUTATION,
      variables: {
        input: {
          roomId: '123',
          itemId: 'item1',
          meId: 'me',
        },
      },
    });

    expect(res.data).toHaveProperty('unlockRoomBoardItem', {
      id: '123',
      items: [{
        id: 'item1',
        lockedBy: null,
        posX: 0,
        posY: 0
      }]
    });
  });

  it('joins the room', async () => {
    const res = await query({
      query: JOIN_ROOM_MUTATION,
      variables: { input: { roomName: 'my-room',  memberName: 'me' } }
    });

    expect(res.data).toHaveProperty('joinRoom', {
      id: 'my-room',
      items: []
    });
  });

  it('gets a room', async ()  => {
    const res = await query({
      query: GET_ROOM_QUERY,
      variables: { id: '123' }
    });

    expect(res.data).toHaveProperty('room', {
      id: '123',
      members: ['person123'],
      items: [
        {
          id: 'item1',
          posX: 0,
          posY: 0,
          lockedBy: null,
        }
      ]
    });
  });
});
