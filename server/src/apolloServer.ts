import { MongoClient } from 'mongodb';
import {ApolloServer, PubSub, withFilter} from 'apollo-server-express';
import typeDefs from './typeDefs';
import RoomsDataSource from './rooms/RoomsDataSource';
import { MongoMemoryServer } from 'mongodb-memory-server';
import itemUpdatesSubscriptionFilter from './items/itemUpdatesSubscriptionFilter';
import roomMemberSubscriptionFilter from './rooms/roomMemberSubscriptionFilter';
import {
  addRoomBoardItem, deleteBoardItem,
  lockRoomBoardItem,
  moveBoardItem,
  unlockRoomBoardItem,
  updateBoardItemText,
} from './items/itemResolvers';
import {joinRoom, resolveRoom} from './rooms/roomResolvers';

export interface DataSources {
  Rooms: RoomsDataSource;
}

export const ITEM_CHANGED_TOPIC = 'item_changed_topic';
export const ROOM_MEMBER_CHANGED_TOPIC = 'room_member_changed_topic';

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

const apolloServer = async () => {
  const mongoClient = await initMongo();

  return new ApolloServer({
    typeDefs,
    resolvers: {
      Query: {
        room: resolveRoom,
      },
      Subscription: {
        itemUpdates: {
          subscribe: withFilter(
            () => pubSub.asyncIterator(ITEM_CHANGED_TOPIC),
            itemUpdatesSubscriptionFilter,
          ),
          resolve: (payload) => payload
        },
        roomMemberUpdates: {
          subscribe: withFilter(
            () => pubSub.asyncIterator(ROOM_MEMBER_CHANGED_TOPIC),
            roomMemberSubscriptionFilter,
          ),
          resolve: (payload) => payload
        }
      },
      Mutation: {
        joinRoom: joinRoom,
        lockRoomBoardItem: lockRoomBoardItem,
        unlockRoomBoardItem: unlockRoomBoardItem,
        moveBoardItem: moveBoardItem,
        addRoomBoardItem: addRoomBoardItem,
        updateBoardItemText: updateBoardItemText,
        deleteBoardItem: deleteBoardItem,
      }
    },
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
