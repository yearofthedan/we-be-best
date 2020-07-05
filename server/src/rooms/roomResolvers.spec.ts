import {PubSub} from 'graphql-subscriptions';
import {Collection} from 'apollo-datasource-mongodb';
import {MongoClient} from 'mongodb';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {joinRoom, resolveRoom} from './roomResolvers';
import RoomsDataSource, {RoomModel} from './RoomsDataSource';
import {ROOM_MEMBER_CHANGED_TOPIC} from '../apolloServer';
import {buildJoinRoomInput} from '../testHelpers/queryTestDataBuilder';
import {buildRoomMemberModel, buildRoomModel} from '../testHelpers/storedTestDataBuilder';

const ROOMS_COLLECTION = 'rooms';

describe('roomResolvers', () => {
  let rooms: RoomsDataSource;
  let connection: MongoClient;
  let roomsCollection: Collection<RoomModel>;

  beforeAll(async () => {
    connection = await MongoClient.connect(await new MongoMemoryServer().getUri(), { useUnifiedTopology: true });
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
  describe('joinRoom', () => {
    it('creates a room if it does not exist', async () => {
      const publishStub = jest.fn();

      const result = await joinRoom(
        undefined,
        { input: buildJoinRoomInput({roomId: 'new-room', memberName: 'me'}) },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      expect(result.id).toEqual('new-room');
      expect(result.members).toEqual([expect.objectContaining({name: 'me'})]);
    });

    it('joins the room if it exists', async () => {
      const room = buildRoomModel({ items: [], members: [buildRoomMemberModel({ name: 'my-mother'})]});
      await roomsCollection.insertOne({...room});

      const publishStub = jest.fn();

      const result = await joinRoom(
        undefined,
        { input: buildJoinRoomInput({roomId: room.id, memberName: 'me'}) },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      expect(result.members)
        .toEqual([
          expect.objectContaining({ name: 'my-mother'}),
          expect.objectContaining({ name: 'me'}),
        ]);
    });

    it('publishes an update after joining a room', async () => {
      const publishStub = jest.fn();

      const result = await joinRoom(
        undefined,
        { input: buildJoinRoomInput({roomId: 'new-room', memberName: 'me'}) },
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
