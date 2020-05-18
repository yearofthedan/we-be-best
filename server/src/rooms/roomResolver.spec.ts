import resolveRoom from './roomResolver';
import RoomDataSource from './RoomDataSource';

describe('roomResolver', () => {
  it('gets the room', async () => {
    const result = await resolveRoom(
      undefined,
      { id: '123' },
      { dataSources: { Room: new RoomDataSource() } }
    );

    expect(result).toEqual({
      'id': '123',
      'members': [
        'stub'
      ],
      'notes': [
        {
          'id': 'ROOM123',
          'moving': false,
          'posX': '0',
          'posY': '0'
        }
      ]
    });
  });
});
