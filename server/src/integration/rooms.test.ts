import {createTestClient} from 'apollo-server-testing';
import server from '../apolloServer';
import {GET_ROOM_QUERY} from '../../../spa/src/components/roomGraphQLQuery';

const { query } = createTestClient(server());

describe('integration: rooms', () => {
  it('gets a room', async ()  => {
    const res = await query({
      query: GET_ROOM_QUERY,
      variables: { id: '123' }
    });

    expect(res.data).toHaveProperty('room', {
      id: '123',
      members: ['stub'],
      notes: [
        {
          id: 'ROOM123',
          moving: false,
          posX: 0,
          posY: 0,
        }
      ]
    });
  });
});
