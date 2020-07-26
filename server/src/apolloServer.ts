import {MongoClient} from 'mongodb';
import {join} from 'path';
import {ApolloServer, PubSub, withFilter} from 'apollo-server-express';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {loadSchemaSync} from '@graphql-tools/load';
import {GraphQLFileLoader} from '@graphql-tools/graphql-file-loader';
import {addResolversToSchema} from '@graphql-tools/schema';
import RoomsDataSource from './rooms/RoomsDataSource';
import noteUpdatesSubscriptionFilter from './notes/noteUpdatesSubscriptionFilter';
import memberSubscriptionFilter from './members/memberSubscriptionFilter';
import {
  addRoomBoardNote,
  deleteBoardNote,
  lockRoomBoardNote,
  moveBoardNote,
  unlockRoomBoardNote,
  updateBoardNoteStyle,
  updateBoardNoteText,
} from './notes/noteResolvers';
import {resolveRoom} from './rooms/roomResolvers';
import {addMember} from './members/memberResolvers';
import {Note, Member} from '@type-definitions/graphql';

export interface DataSources {
  Rooms: RoomsDataSource;
}

export const NOTE_CHANGED_TOPIC = 'note_changed_topic';
export const MEMBER_CHANGED_TOPIC = 'member_changed_topic';

const pubSub = new PubSub();

const ROOMS_COLLECTION = 'rooms';
const initMongo = async () => {
  const mongod = new MongoMemoryServer();
  const uri = await mongod.getUri();
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  await client.db().collection(ROOMS_COLLECTION).createIndex({'notes.id': 1});

  return client;
};

const schema = loadSchemaSync(join(__dirname, 'schema.graphql'), { loaders: [new GraphQLFileLoader()] });
export const resolvers = {
  Query: {
    room: resolveRoom,
  },
  Subscription: {
    noteUpdates: {
      subscribe: withFilter(
        () => pubSub.asyncIterator(NOTE_CHANGED_TOPIC),
        noteUpdatesSubscriptionFilter,
      ),
        resolve: (payload: Note) => payload
    },
    memberUpdates: {
      subscribe: withFilter(
        () => pubSub.asyncIterator(MEMBER_CHANGED_TOPIC),
        memberSubscriptionFilter,
      ),
        resolve: (payload: Member) => payload
    }
  },
  Mutation: {
    addMember: addMember,
    lockRoomBoardNote: lockRoomBoardNote,
    unlockRoomBoardNote: unlockRoomBoardNote,
    moveBoardNote: moveBoardNote,
    addRoomBoardNote: addRoomBoardNote,
    updateBoardNoteText: updateBoardNoteText,
    updateBoardNoteStyle: updateBoardNoteStyle,
    deleteBoardNote: deleteBoardNote,
  }
};

const apolloServer = async (): Promise<ApolloServer> => {
  const mongoClient = await initMongo();

  const schemaWithResolvers = addResolversToSchema({
    schema,
    resolvers,
  });

  return new ApolloServer({
    schema: schemaWithResolvers,
    dataSources: () => ({
      Rooms: new RoomsDataSource(mongoClient.db().collection(ROOMS_COLLECTION))
    }),
    context: ({connection}) => {
      if (connection) {
        return {
          dataSources: {
            Rooms: new RoomsDataSource(mongoClient.db().collection(ROOMS_COLLECTION))
          },
          pubSub
        };
      }
      return {
        pubSub
      };
    }
  });
};

export default apolloServer;
