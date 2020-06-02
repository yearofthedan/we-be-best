import {createTestClient} from 'apollo-server-testing';
import { v4 } from 'uuid';
import server from '../apolloServer';
import {
  ADD_ROOM_BOARD_ITEM_MUTATION,
  GET_ROOM_QUERY,
  JOIN_ROOM_MUTATION,
  LOCK_ROOM_BOARD_ITEM_MUTATION,
  UNLOCK_ROOM_BOARD_ITEM_MUTATION,
} from '../../../spa/src/components/Room/roomGraphQLQuery';

const { query } = createTestClient(server());
const ROOM_ID = '123';
const ITEM_ID = 'item1';

describe('integration: rooms', () => {
  const seedRoom = async () => {
    const roomId = v4();
    await query({
      query: JOIN_ROOM_MUTATION,
      variables: { input: { roomName: roomId,  memberName: 'me' } }
    });

    return roomId;
  };

  const seedRoomWithItem = async () => {
    const roomId = await seedRoom();
    await query({
      query: ADD_ROOM_BOARD_ITEM_MUTATION,
      variables: {
        input: {
          roomId: roomId,
          itemId: ITEM_ID,
          posX: 0,
          posY: 0,
        },
      },
    });
    return roomId;
  };

  it('adds an item', async () => {
    const roomId = await seedRoom();
    const res = await query({
      query: ADD_ROOM_BOARD_ITEM_MUTATION,
      variables: {
        input: {
          roomId: roomId,
          itemId: ITEM_ID,
          posX: 0,
          posY: 0,
        },
      },
    });

    expect(res.data).toHaveProperty('addRoomBoardItem', {
      id: roomId,
      items: [{
        id: ITEM_ID,
        lockedBy: null,
        posX: 0,
        posY: 0
      }]
    });
  });
  it('locks an item', async () => {
    const roomId = await seedRoomWithItem();

    const res = await query({
      query: LOCK_ROOM_BOARD_ITEM_MUTATION,
      variables: {
        input: {
          roomId: roomId,
          itemId: ITEM_ID,
          meId: 'me',
        },
      },
    });

    expect(res.data).toHaveProperty('lockRoomBoardItem', {
      id: roomId,
      items: [{
        id: ITEM_ID,
        lockedBy: 'me',
        posX: 0,
        posY: 0
      }]
    });
  });
  it('unlocks an item', async () => {
    const roomId = await seedRoomWithItem();
    await query({
      query: LOCK_ROOM_BOARD_ITEM_MUTATION,
      variables: {
        input: {
          roomId: roomId,
          itemId: 'item1',
          meId: 'me',
        },
      },
    });

    const res = await query({
      query: UNLOCK_ROOM_BOARD_ITEM_MUTATION,
      variables: {
        input: {
          roomId: roomId,
          itemId: 'item1',
          meId: 'me',
        },
      },
    });

    expect(res.data).toHaveProperty('unlockRoomBoardItem', {
      id: roomId,
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
    const roomId = await seedRoom();
    const res = await query({
      query: GET_ROOM_QUERY,
      variables: { id: roomId }
    });

    expect(res.data).toHaveProperty('room', {
      id: roomId,
      members: ['me'],
      items: []
    });
  });
});
