import {MongoClient} from 'mongodb';
import {join} from 'path';
import {ApolloServer, PubSub, withFilter} from 'apollo-server-express';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {loadSchemaSync} from '@graphql-tools/load';
import {GraphQLFileLoader} from '@graphql-tools/graphql-file-loader';
import {addResolversToSchema} from '@graphql-tools/schema';
import RoomsDataSource from './rooms/RoomsDataSource';
import itemUpdatesSubscriptionFilter from './items/itemUpdatesSubscriptionFilter';
import memberSubscriptionFilter from './members/memberSubscriptionFilter';
import {
  addRoomBoardItem,
  deleteBoardItem,
  lockRoomBoardItem,
  moveBoardItem,
  unlockRoomBoardItem,
  updateBoardItemStyle,
  updateBoardItemText,
} from './items/itemResolvers';
import {resolveRoom} from './rooms/roomResolvers';
import {addMember} from './members/memberResolvers';
import {Item, Member} from '@type-definitions/graphql';

export interface DataSources {
  Rooms: RoomsDataSource;
}

export const ITEM_CHANGED_TOPIC = 'item_changed_topic';
export const MEMBER_CHANGED_TOPIC = 'member_changed_topic';

const pubSub = new PubSub();

const ROOMS_COLLECTION = 'rooms';
const initMongo = async () => {
  const mongod = new MongoMemoryServer();
  const uri = await mongod.getUri();
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  await client.db().collection(ROOMS_COLLECTION).createIndex({'items.id': 1});

  return client;
};

const schema = loadSchemaSync(join(__dirname, 'schema.graphql'), { loaders: [new GraphQLFileLoader()] });
export const resolvers = {
  Query: {
    room: resolveRoom,
  },
  Subscription: {
    itemUpdates: {
      subscribe: withFilter(
        () => pubSub.asyncIterator(ITEM_CHANGED_TOPIC),
        itemUpdatesSubscriptionFilter,
      ),
        resolve: (payload: Item) => payload
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
    lockRoomBoardItem: lockRoomBoardItem,
    unlockRoomBoardItem: unlockRoomBoardItem,
    moveBoardItem: moveBoardItem,
    addRoomBoardItem: addRoomBoardItem,
    updateBoardItemText: updateBoardItemText,
    updateBoardItemStyle: updateBoardItemStyle,
    deleteBoardItem: deleteBoardItem,
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
    context: ({req, connection}) => {
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
