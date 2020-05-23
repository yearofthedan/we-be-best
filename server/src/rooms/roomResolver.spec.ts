import {PubSub} from 'graphql-subscriptions';
import resolveRoom, {updateRoomNotes} from './roomResolver';
import RoomDataSource from './RoomDataSource';
import {ROOM_CHANGED_TOPIC} from '../apolloServer';

describe('roomResolver', () => {
  describe('updateRoomNotes', () => {
    it('updates the room notes and announces the change', async () => {
      const publishStub = jest.fn();

      const result = await updateRoomNotes(
        undefined,
        {
          input: {
            id: '123',
            notes: [
              {
                id: 'note2',
                moving: false,
                posX: 0,
                posY: 0,
              },
            ],
          },
        },
        {
          pubSub: {
            publish: publishStub,
            dataSource: { Room: new RoomDataSource() }
          } as unknown as PubSub,
          dataSources: {Room: new RoomDataSource()}},
      );

      const expected = {
        id: '123',
        notes: [
          {
            id: 'note2',
            moving: false,
            posX: 0,
            posY: 0,
          },
        ],
        members: ['person123'],
      };

      expect(result).toEqual(expected);
      expect(publishStub).toHaveBeenCalledWith(ROOM_CHANGED_TOPIC, {
        roomUpdates: expected
      });
    });
  });

  describe('resolveRoom', () => {
    it('gets the room', async () => {
      const result = await resolveRoom(
        undefined,
        {id: '123'},
        {dataSources: {Room: new RoomDataSource()}},
      );

      expect(result).toEqual({
        'id': '123',
        'members': [
          'person123',
        ],
        'notes': [
          {
            'id': 'note2',
            'moving': false,
            'posX': 0,
            'posY': 0,
          },
        ],
      });
    });
  });
})
;
