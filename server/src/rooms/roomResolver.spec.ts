import {PubSub} from 'graphql-subscriptions';
import resolveRoom, {updateRoomBoardItems} from './roomResolver';
import RoomDataSource from './RoomDataSource';
import {ROOM_CHANGED_TOPIC} from '../apolloServer';

describe('roomResolver', () => {
  describe('updateRoomBoardItems', () => {
    it('updates the room items and announces the change', async () => {
      const publishStub = jest.fn();

      const result = await updateRoomBoardItems(
        undefined,
        {
          input: {
            id: '123',
            items: [
              {
                id: 'item2',
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
        items: [
          {
            id: 'item2',
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
        'items': [
          {
            'id': 'item2',
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
