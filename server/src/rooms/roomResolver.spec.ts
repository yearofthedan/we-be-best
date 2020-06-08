import {PubSub} from 'graphql-subscriptions';
import resolveRoom, {
  addRoomBoardItem,
  joinRoom,
  lockRoomBoardItem,
  unlockRoomBoardItem,
  updateRoomBoardItems,
} from './roomResolver';
import RoomDataSource from './RoomDataSource';
import {ROOM_CHANGED_TOPIC, ROOM_MEMBER_CHANGED_TOPIC} from '../apolloServer';

const ROOM_123 = '123';
describe('roomResolver', () => {
  beforeEach(() => {
    new RoomDataSource().clear();
  });

  describe('addRoomBoardItem', () => {
    it('adds the item and publishes the update', async () => {
      const roomDataSource = new RoomDataSource();
      roomDataSource.addMember(ROOM_123, 'me');
      const publishStub = jest.fn();

      const result = await addRoomBoardItem(
        undefined,
        {
          input: {
            roomId: ROOM_123,
            itemId: 'item1',
            posX: 0,
            posY: 0,
          },
        },
        {
          pubSub: {
            publish: publishStub,
            dataSource: {Room: new RoomDataSource()},
          } as unknown as PubSub,
          dataSources: {Room: new RoomDataSource()},
        },
      );

      const expected = {
        id: ROOM_123,
        items: [
          {
            id: 'item1',
            posX: 0,
            posY: 0,
          },
        ],
        members: ['me']
      };

      expect(result).toEqual(expected);
      expect(publishStub).toHaveBeenCalledWith(ROOM_CHANGED_TOPIC, {
        roomUpdates: expected,
      });
    });
  });
  describe('lockRoomBoardItem', () => {
    it('locks the item and publishes the update', async () => {
      const roomDataSource = new RoomDataSource();
      roomDataSource.addMember('123', 'me');
      roomDataSource.updateItems({ id: '123', items: [{
          id: 'item1',
          posX: 0,
          posY: 0,
        }]});

      const publishStub = jest.fn();

      const result = await lockRoomBoardItem(
        undefined,
        {
          input: {
            roomId: '123',
            itemId: 'item1',
            meId: 'me',
          },
        },
        {
          pubSub: {
            publish: publishStub,
            dataSource: {Room: new RoomDataSource()},
          } as unknown as PubSub,
          dataSources: {Room: new RoomDataSource()},
        },
      );

      const expected = {
        id: '123',
        items: [
          {
            id: 'item1',
            lockedBy: 'me',
            posX: 0,
            posY: 0,
          },
        ],
        members: ['me']
      };

      expect(result).toEqual(expected);
      expect(publishStub).toHaveBeenCalledWith(ROOM_CHANGED_TOPIC, {
        roomUpdates: expected,
      });
    });
  });
  describe('unlockRoomBoardItem', () => {
    it('unlocks the item and publishes the update', async () => {
      const roomDataSource = new RoomDataSource();
      roomDataSource.addMember('123', 'me');
      roomDataSource.updateItems({ id: '123', items: [{
          id: 'item1',
          posX: 0,
          posY: 0,
          lockedBy: 'me',
        }]});

      const publishStub = jest.fn();

      const result = await unlockRoomBoardItem(
        undefined,
        {
          input: {
            roomId: '123',
            itemId: 'item1',
            meId: 'me',
          },
        },
        {
          pubSub: {
            publish: publishStub,
            dataSource: {Room: new RoomDataSource()},
          } as unknown as PubSub,
          dataSources: {Room: new RoomDataSource()},
        },
      );

      const expected = {
        id: '123',
        items: [
          {
            id: 'item1',
            posX: 0,
            posY: 0,
          },
        ],
        members: ['me']
      };

      expect(result).toEqual(expected);
      expect(publishStub).toHaveBeenCalledWith(ROOM_CHANGED_TOPIC, {
        roomUpdates: expected,
      });
    });
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
            dataSource: {Room: new RoomDataSource()},
          } as unknown as PubSub,
          dataSources: {Room: new RoomDataSource()},
        },
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
        roomUpdates: expected,
      });
    });
  });
  describe('joinRoom', () => {
    it('creates a room if it does not exist', async () => {
      const roomDataSource = new RoomDataSource();

      const result = await joinRoom(
        undefined,
        {input: {roomName: 'my-room', memberName: 'me'}},
        {
          pubSub: {
            publish: jest.fn(),
            dataSource: {Room: new RoomDataSource()},
          } as unknown as PubSub,
          dataSources: {Room: roomDataSource}
        },
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
        }],
      });

      const result = await joinRoom(
        undefined,
        {input: {roomName: 'my-room', memberName: 'me'}},
        {
          pubSub: {
            publish: jest.fn(),
            dataSource: {Room: new RoomDataSource()},
          } as unknown as PubSub,
          dataSources: {Room: roomDataSource}
        },
      );

      expect(result).toEqual({
        id: 'my-room',
        members: ['my-mother', 'me'],
        items: [{
          id: 'item1',
          lockedBy: 'my-mother',
          posX: 0,
          posY: 0,
        }],
      });
    });

    it('publishes an update after joining a room', async () => {
      const publishStub = jest.fn();
      const roomDataSource = new RoomDataSource();
      roomDataSource.addMember('my-room', 'my-mother');

      await joinRoom(
        undefined,
        {input: {roomName: 'my-room', memberName: 'me'}},
        {
          pubSub: {
            publish: publishStub,
            dataSource: {Room: new RoomDataSource()},
          } as unknown as PubSub,
          dataSources: {Room: roomDataSource}
        },
      );

      const expected = {
        id: 'my-room',
        members: ['my-mother', 'me'],
        items: [] as string[]
      };

      expect(publishStub).toHaveBeenCalledWith(ROOM_MEMBER_CHANGED_TOPIC, expected);
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
        ],
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
});
