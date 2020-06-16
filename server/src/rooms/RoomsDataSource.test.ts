import {Collection} from 'apollo-datasource-mongodb';
import {MongoClient, Db} from 'mongodb';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {buildItemModel, buildRoomModel} from '../testHelpers/storedTestDataBuilder';
import RoomsDataSource, {NewItemParam, RoomModel, UpdateItemParam} from './RoomsDataSource';

const ROOMS_COLLECTION = 'rooms';

export const buildNewItemParam = (overrides: Partial<NewItemParam> = {}): NewItemParam => ({
  id: 'item1',
  posX: 0,
  posY: 0,
  text: 'some text',
  ...overrides
});

export const buildUpdateItemParam = (overrides: Partial<UpdateItemParam> = {}): UpdateItemParam => ({
  id: 'item1',
  posX: 0,
  posY: 0,
  text: 'some text',
  ...overrides
});

describe('RoomsDataSource', () => {
  let rooms: RoomsDataSource;
  let connection: MongoClient;
  let db: Db;
  let roomsCollection: Collection<RoomModel>;

  beforeAll(async () => {
    connection = await MongoClient.connect(await new MongoMemoryServer().getUri(), { useUnifiedTopology: true });
    db = await connection.db();
    roomsCollection = await db.createCollection(ROOMS_COLLECTION);
    await roomsCollection.createIndex({'items.id': 1});
  });
  afterAll( () => {
    return connection.close(true);
  });
  beforeEach(async () => {
    await roomsCollection.deleteMany({});
    rooms = new RoomsDataSource(roomsCollection);
  });

  describe('addItem', () => {
    it('adds an item', async () => {
      const room = buildRoomModel({id: 'ROOM_123', items: []});
      await roomsCollection.insertOne({...room});
      const itemParams = buildNewItemParam({
        id: 'ITEM_123',
        posX: 10,
        posY: 20,
        text: 'some text'
      });

      const itemModel = await rooms.addItem(room.id, itemParams);

      expect(itemModel).toEqual({
        id: itemParams.id,
        posX: itemParams.posX,
        posY: itemParams.posY,
        text: itemParams.text,
        room: room.id,
        lockedBy: null,
      });
    });
  });

  describe('updateItem', () => {
    it('updates an existing item', async () => {
      const existingItemModel = buildItemModel({id: 'ITEM_123', room: 'ROOM_123'});
      const room = buildRoomModel({id: 'ROOM_123', items: [existingItemModel]});
      await roomsCollection.insertOne({...room});

      const itemParams = buildUpdateItemParam({
        id: 'ITEM_123',
        text: 'YOLO',
        posX: 100,
        posY: 300,
      });

      const itemModel = await rooms.updateItem(itemParams);

      expect(itemModel).toEqual({
        ...existingItemModel,
        text: itemParams.text,
        posX: 100,
        posY: 300,
      });
    });

    it('does not overwrite undefined keys', async () => {
      const existingItemModel = buildItemModel({id: 'ITEM_123', room: 'ROOM_123'});
      const room = buildRoomModel({id: 'ROOM_123', items: [existingItemModel]});
      await roomsCollection.insertOne({...room});

      const itemParams = buildUpdateItemParam({
        id: 'ITEM_123',
        text: 'YOLO',
        posX: undefined,
        posY: undefined,
      });

      const itemModel = await rooms.updateItem(itemParams);

      expect(itemModel).toEqual({
        ...existingItemModel,
        text: itemParams.text
      });
    });

    it('does overwrite null keys', async () => {
      const existingItemModel = buildItemModel({id: 'ITEM_123', room: 'ROOM_123'});
      const room = buildRoomModel({id: 'ROOM_123', items: [existingItemModel]});
      await roomsCollection.insertOne({...room});

      const itemParams = buildUpdateItemParam({
        id: 'ITEM_123',
        text: null,
        posX: null,
        posY: null,
      });

      const itemModel = await rooms.updateItem(itemParams);

      expect(itemModel).toEqual({
        ...existingItemModel,
        text: null,
        posX: null,
        posY: null,
      });
    });

    it('updates the correct item in the list', async () => {
      const existingItemModelFirst = buildItemModel({id: 'ITEM_1', room: 'ROOM_123'});
      const existingItemModelSecond = buildItemModel({id: 'ITEM_2', room: 'ROOM_123'});
      const existingItemModelThird = buildItemModel({id: 'ITEM_3', room: 'ROOM_123'});

      const room = buildRoomModel(
        {id: 'ROOM_123', items: [existingItemModelFirst, existingItemModelSecond, existingItemModelThird]}
      );
      await roomsCollection.insertOne({...room});

      const itemParams = buildUpdateItemParam({
        id: 'ITEM_2',
        text: 'interesting',
        posX: undefined, posY: undefined,
      });

      const itemModel = await rooms.updateItem(itemParams);

      expect(itemModel).toEqual({
        ...existingItemModelSecond,
        text: 'interesting',
      });
    });
  });

  describe('addMember', () => {
    it('adds a member to an existing room', async () => {
      const existingRoomModel = buildRoomModel({id: 'ROOM_123', members: ['me']});
      await roomsCollection.insertOne(existingRoomModel);

      const roomModel = await rooms.addMember(existingRoomModel.id, 'my-mum');

      expect(roomModel).toEqual({
        ...existingRoomModel,
        members: ['me', 'my-mum']
      });
    });

    it('creates the room if it does not exist', async () => {
      const roomModel = await rooms.addMember('new-room', 'my-mum');

      expect(roomModel).toEqual({
        _id: expect.anything(),
        id: 'new-room',
        items: [],
        members: ['my-mum']
      });
    });
  });

});
