import {Collection} from 'apollo-datasource-mongodb';
import {MongoClient} from 'mongodb';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {resolveRoom} from './roomResolvers';
import RoomsDataSource, {RoomModel} from './RoomsDataSource';
import {buildRoomModel} from '@/testHelpers/storedTestDataBuilder';

const ROOMS_COLLECTION = 'rooms';

describe('roomResolvers', () => {
  let rooms: RoomsDataSource;
  let connection: MongoClient;
  let roomsCollection: Collection<RoomModel>;

  beforeAll(async () => {
    connection = await MongoClient.connect(await new MongoMemoryServer().getUri(), { useUnifiedTopology: true });
    const db = await connection.db();
    roomsCollection = await db.createCollection(ROOMS_COLLECTION);
    await roomsCollection.createIndex({'notes.id': 1});
  });
  afterAll(async () => {
    await connection.close();
  });
  beforeEach(async () => {
    await roomsCollection.deleteMany({});
    rooms = new RoomsDataSource(roomsCollection);
  });

  describe('resolveRoom', () => {
    it('gets the room', async () => {
      const room = buildRoomModel({ id: 'ROOM_123', notes: [], members: []});
      await roomsCollection.insertOne({...room});

      const result = await resolveRoom(undefined, {id: 'ROOM_123'}, {dataSources: {Rooms: rooms}});

      expect(result).toEqual({ id: 'ROOM_123', notes: [], members: []});
    });
  });
});
