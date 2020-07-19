import {PubSub} from 'graphql-subscriptions';
import {Collection} from 'apollo-datasource-mongodb';
import {MongoClient} from 'mongodb';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {addMember} from './memberResolvers';
import {MEMBER_CHANGED_TOPIC} from '../apolloServer';
import {buildAddMemberInput} from '../testHelpers/queryTestDataBuilder';
import {buildRoomMemberModel, buildRoomModel} from '../testHelpers/storedTestDataBuilder';
import RoomsDataSource, {RoomModel} from '../rooms/RoomsDataSource';

const ROOMS_COLLECTION = 'rooms';

describe('memberResolvers', () => {
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
  describe('addMember', () => {
    it('creates a room if it does not exist', async () => {
      const publishStub = jest.fn();

      const result = await addMember(
        undefined,
        { input: buildAddMemberInput({roomId: 'new-room', memberName: 'me'}) },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      expect(result).toMatchObject({
        id: expect.any(String),
        name: 'me'
      });
    });

    it('joins the room if it exists', async () => {
      const room = buildRoomModel({ notes: [], members: [buildRoomMemberModel({ name: 'my-mother'})]});
      await roomsCollection.insertOne({...room});

      const publishStub = jest.fn();

      const result = await addMember(
        undefined,
        { input: buildAddMemberInput({roomId: room.id, memberName: 'me'}) },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      expect(result).toMatchObject({
        id: expect.any(String),
        name: 'me'
      });
    });

    it('publishes an update after joining a room', async () => {
      const publishStub = jest.fn();

      const result = await addMember(
        undefined,
        { input: buildAddMemberInput({roomId: 'new-room', memberName: 'me'}) },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      expect(publishStub).toHaveBeenCalledWith(MEMBER_CHANGED_TOPIC, result);
    });
  });
});
