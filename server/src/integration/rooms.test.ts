import {createTestClient} from 'apollo-server-testing';
import server from '../apolloServer';
import {GET_ROOM_QUERY, JOIN_ROOM_MUTATION} from '../../../spa/src/components/Room/roomGraphQLQuery';

const { query } = createTestClient(server());

describe('integration: rooms', () => {
  it('joins the room', async () => {
    const res = await query({
      query: JOIN_ROOM_MUTATION,
      variables: { input: { roomName: 'my-room',  memberName: 'me' } }
    });

    expect(res.data).toHaveProperty('joinRoom', {
      id: 'my-room',
      members: ['me'],
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
