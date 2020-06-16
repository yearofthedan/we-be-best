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
import RoomsDataSource, {RoomModel} from './RoomsDataSource';
import {ITEM_CHANGED_TOPIC, ROOM_MEMBER_CHANGED_TOPIC} from '../apolloServer';
import {
  buildAddItemInput,
  buildJoinRoomInput,
  buildLockItemInput,
  buildUnlockItemInput,
  buildUpdateItemsInput,
} from '../testHelpers/queryTestDataBuilder';
import {buildItemData, buildItemModel, buildRoomModel} from '../testHelpers/storedTestDataBuilder';

const ROOMS_COLLECTION = 'rooms';

describe('roomResolver', () => {
  let rooms: RoomsDataSource;
  let connection: MongoClient;
  let roomsCollection: Collection<RoomModel>;

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
    rooms = new RoomsDataSource(roomsCollection);
  });

  describe('addRoomBoardItem', () => {
    it('adds the item and publishes the update', async () => {
      const room = buildRoomModel({id: 'ROOM_123', items: []});
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
        lockedBy: null,
        text: '',
        room: 'ROOM_123'
      });
      expect(publishStub).toHaveBeenCalledWith(ITEM_CHANGED_TOPIC, {
        id: itemInput.itemId,
        posX: itemInput.posX,
        posY: itemInput.posY,
        lockedBy: null,
        text: '',
        room: 'ROOM_123'
      });
    });
  });
  describe('lockRoomBoardItem', () => {
    it('locks the item and publishes the update', async () => {
      const publishStub = jest.fn();
      const existingItemModel = buildItemModel({ id: 'item-id', room: 'ROOM_123' });
      const existingRoomModel = buildRoomModel({id: 'ROOM_123', items: [existingItemModel]});
      await roomsCollection.insertOne(existingRoomModel);

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

      const expected = { ...existingItemModel, lockedBy: 'me' };

      expect(result).toEqual(expected);
      expect(publishStub).toHaveBeenCalledWith(ITEM_CHANGED_TOPIC, expected);
    });
  });
  describe('unlockRoomBoardItem', () => {
    it('unlocks the item', async () => {
      const roomItemData = buildItemData({ id: 'item-id', lockedBy: 'me'});
      const room = buildRoomModel({items: [roomItemData]});
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
      const room = buildRoomModel({items: [roomItemData]});
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

      expect(publishStub).toHaveBeenCalledWith(ITEM_CHANGED_TOPIC, result);
    });
  });
  describe('moveBoardItem', () => {
    it('updates the item', async () => {
      const existingItemModel = buildItemData({ id: 'item1'});
      const room = buildRoomModel({id: 'ROOM_123', items: [existingItemModel]});
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

      expect(result).toEqual({ ...existingItemModel, posX: 100, posY: 33 });
    });

    it('publishes an update after updating', async () => {
      const existingItemModel = buildItemData({ id: 'item1'});
      const room = buildRoomModel({ items: [existingItemModel]});
      await roomsCollection.insertOne({...room});
      const publishStub = jest.fn();

      await moveBoardItem(
        undefined,
        {
          input: buildUpdateItemsInput({ id: 'item1', posX: 100, posY: 33 }),
        },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      expect(publishStub).toHaveBeenCalledWith(ITEM_CHANGED_TOPIC, { ...existingItemModel, posX: 100, posY: 33 });

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
      const room = buildRoomModel({ items: [], members: ['my-mother']});
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
      const room = buildRoomModel({ id: 'ROOM_123', items: [], members: []});
      await roomsCollection.insertOne({...room});

      const result = await resolveRoom(undefined, {id: 'ROOM_123'}, {dataSources: {Rooms: rooms}});

      expect(result).toEqual({ id: 'ROOM_123', items: [], members: []});
    });
  });
});
