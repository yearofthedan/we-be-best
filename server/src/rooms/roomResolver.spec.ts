import {PubSub} from 'graphql-subscriptions';
import resolveRoom, {joinRoom, updateRoomBoardItems} from './roomResolver';
import RoomDataSource from './RoomDataSource';
import {ROOM_CHANGED_TOPIC} from '../apolloServer';

describe('roomResolver', () => {
  beforeEach(() => {
    new RoomDataSource().clear();
  });

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
                id: 'item1',
                lockedBy: 'me',
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
        items: [
          {
            id: 'item1',
            lockedBy: 'me',
            posX: 0,
            posY: 0,
          },
        ],
      };

      expect(result).toEqual(expected);
      expect(publishStub).toHaveBeenCalledWith(ROOM_CHANGED_TOPIC, {
        roomUpdates: expected
      });
    });
  });

  describe('joinRoom', () => {
    it('creates a room if it does not exist', async () => {
      const roomDataSource = new RoomDataSource();

      const result = await joinRoom(
        undefined,
        { input: { roomName: 'my-room', memberName: 'me' } },
        {dataSources: {Room: roomDataSource}},
      );

      expect(result).toEqual({
        id: 'my-room',
        members: ['me'],
        items: [],
      });
    });

    it('joins the room if it exists', async () => {
      const roomDataSource = new RoomDataSource();
      roomDataSource.addMember('my-room', 'my-mother');
      roomDataSource.updateItems({
        id: 'my-room',
        items: [{
          id: 'item1',
          lockedBy: 'my-mother',
          posX: 0,
          posY: 0,
        }]
      });

      const result = await joinRoom(
        undefined,
        { input: { roomName: 'my-room', memberName: 'me' } },
        {dataSources: {Room: roomDataSource}},
      );

      expect(result).toEqual({
        id: 'my-room',
        members: ['my-mother', 'me'],
        items: [{
          id: 'item1',
          lockedBy: 'my-mother',
          posX: 0,
          posY: 0,
        },],
      });
    });
  });

  describe('resolveRoom', () => {
    it('gets the room', async () => {
      const roomDataSource = new RoomDataSource();
      roomDataSource.updateItems({
        id: '123',
        items: [
          {
            id: 'item1',
            lockedBy: 'me',
            posX: 0,
            posY: 0,
          },
        ]
      });
      const result = await resolveRoom(
        undefined,
        {id: '123'},
        {dataSources: {Room: roomDataSource}},
      );

      expect(result).toEqual({
        'items': [
          {
            id: 'item1',
            lockedBy: 'me',
            posX: 0,
            posY: 0,
          },
        ],
      });
    });
  });
})
;
