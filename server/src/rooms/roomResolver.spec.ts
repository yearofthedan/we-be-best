import {PubSub} from 'graphql-subscriptions';
import {Collection} from 'apollo-datasource-mongodb';
import {MongoClient} from 'mongodb';
import {MongoMemoryServer} from 'mongodb-memory-server';
import resolveRoom, {
  addRoomBoardItem,
  joinRoom,
  lockRoomBoardItem,
  unlockRoomBoardItem,
  moveBoardItem,
} from './roomResolver';
import RoomDataSource from './RoomDataSource';
import Rooms, {RoomData} from './RoomDataSource';
import {ITEM_CHANGED_TOPIC, ROOM_MEMBER_CHANGED_TOPIC} from '../apolloServer';
import {
  buildAddItemInput,
  buildJoinRoomInput,
  buildLockItemInput,
  buildUnlockItemInput,
  buildUpdateItemsInput,
} from '../testHelpers/queryTestDataBuilder';
import {buildItemData, buildRoomData} from '../testHelpers/storedTestDataBuilder';

const ROOMS_COLLECTION = 'rooms';

describe('roomResolver', () => {
  let rooms: RoomDataSource;
  let connection: MongoClient;
  let roomsCollection: Collection<RoomData>;

  beforeAll(async () => {
    connection = await MongoClient.connect(await new MongoMemoryServer().getUri());
    const db = await connection.db();
    roomsCollection = await db.createCollection(ROOMS_COLLECTION);
    await roomsCollection.createIndex({'items.id': 1});
  });
  afterAll(async () => {
    await connection.close();
  });
  beforeEach(async () => {
    await roomsCollection.deleteMany({});
    rooms = new Rooms(roomsCollection);
  });

  describe('addRoomBoardItem', () => {
    it('adds the item and publishes the update', async () => {
      const room = buildRoomData({id: 'ROOM_123', items: []});
      await roomsCollection.insertOne({...room});
      const itemInput = buildAddItemInput({roomId: 'ROOM_123', itemId: 'ITEM_123' });
      const publishStub = jest.fn();
      const result = await addRoomBoardItem(
        undefined,
        { input: itemInput },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      expect(result).toEqual({
        id: itemInput.itemId,
        posX: itemInput.posX,
        posY: itemInput.posY,
      });
      expect(publishStub).toHaveBeenCalledWith(ITEM_CHANGED_TOPIC, {
        item: result,
        roomId:  'ROOM_123',
      });
    });
  });
  describe('lockRoomBoardItem', () => {
    it('locks the item and publishes the update', async () => {
      const publishStub = jest.fn();
      const roomItemData = buildItemData({ id: 'item-id'});
      const room = buildRoomData({id: 'ROOM_123', items: [roomItemData]});
      await roomsCollection.insertOne({...room});

      const result = await lockRoomBoardItem(
        undefined,
        {
          input: buildLockItemInput({id: 'item-id', lockedBy: 'me' })
        },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      const expected = { ...roomItemData, lockedBy: 'me' };

      expect(result).toEqual(expected);
      expect(publishStub).toHaveBeenCalledWith(ITEM_CHANGED_TOPIC, {
        item: expected,
        roomId: 'ROOM_123'
      });
    });
  });
  describe('unlockRoomBoardItem', () => {
    it('unlocks the item', async () => {
      const roomItemData = buildItemData({ id: 'item-id', lockedBy: 'me'});
      const room = buildRoomData({items: [roomItemData]});
      await roomsCollection.insertOne({...room});

      const result = await unlockRoomBoardItem(
        undefined,
        {
          input: buildUnlockItemInput({ id: roomItemData.id })
        },
        {
          pubSub: { publish: jest.fn(), dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      const expected = { ...roomItemData, lockedBy: null as string };

      expect(result).toEqual(expected);
    });

    it('publishes an update when the item is unlocked', async () => {
      const publishStub = jest.fn();
      const roomItemData = buildItemData({ id: 'item-id', lockedBy: 'me'});
      const room = buildRoomData({items: [roomItemData]});
      await roomsCollection.insertOne({...room});

      const result = await unlockRoomBoardItem(
        undefined,
        {
          input: buildUnlockItemInput({ id: roomItemData.id })
        },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      expect(publishStub).toHaveBeenCalledWith(ITEM_CHANGED_TOPIC, {
        item: result,
        roomId: room.id
      });
    });
  });
  describe('moveBoardItem', () => {
    it('updates the item', async () => {
      const room = buildRoomData({id: 'ROOM_123', items: [buildItemData({ id: 'item1'})]});
      await roomsCollection.insertOne({...room});
      const result = await moveBoardItem(
        undefined,
        {
          input: buildUpdateItemsInput({ id: 'item1', posX: 100, posY: 33 }),
        },
        {
          pubSub: { publish: jest.fn(), dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      const expected = { id: 'item1', posX: 100, posY: 33, lockedBy: 'me' };
      expect(result).toEqual(expected);
    });

    it('publishes an update after updating', async () => {
      const room = buildRoomData({ items: [buildItemData({id: 'item1'})]});
      await roomsCollection.insertOne({...room});
      const publishStub = jest.fn();

      const result = await moveBoardItem(
        undefined,
        {
          input: buildUpdateItemsInput({ id: 'item1', posX: 0, posY: 0 }),
        },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      expect(publishStub).toHaveBeenCalledWith(ITEM_CHANGED_TOPIC, {
        item: result,
        roomId: room.id
      });
    });
  });
  describe('joinRoom', () => {
    it('creates a room if it does not exist', async () => {
      const publishStub = jest.fn();

      const result = await joinRoom(
        undefined,
        { input: buildJoinRoomInput({roomName: 'new-room', memberName: 'me'}) },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      expect(result.id).toEqual('new-room');
      expect(result.members).toEqual(['me']);
    });

    it('joins the room if it exists', async () => {
      const room = buildRoomData({ items: [], members: ['my-mother']});
      await roomsCollection.insertOne({...room});

      const publishStub = jest.fn();

      const result = await joinRoom(
        undefined,
        { input: buildJoinRoomInput({roomName: room.id, memberName: 'me'}) },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      expect(result.members).toEqual(['my-mother', 'me']);
    });

    it('publishes an update after joining a room', async () => {
      const publishStub = jest.fn();

      const result = await joinRoom(
        undefined,
        { input: buildJoinRoomInput({roomName: 'new-room', memberName: 'me'}) },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      expect(publishStub).toHaveBeenCalledWith(ROOM_MEMBER_CHANGED_TOPIC, result);
    });
  });
  describe('resolveRoom', () => {
    it('gets the room', async () => {
      const room = buildRoomData({ id: 'ROOM_123', items: [], members: []});
      await roomsCollection.insertOne({...room});

      const result = await resolveRoom(undefined, {id: 'ROOM_123'}, {dataSources: {Rooms: rooms}});

      expect(result).toEqual({ id: 'ROOM_123', items: [], members: []});
    });
  });
});
