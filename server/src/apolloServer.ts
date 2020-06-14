import {ApolloServer, PubSub, withFilter} from 'apollo-server-express';
import typeDefs from './typeDefs';
import RoomDataSource from './rooms/RoomDataSource';
import resolveRoom, {
  addRoomBoardItem,
  joinRoom,
  lockRoomBoardItem,
  unlockRoomBoardItem,
  moveBoardItem,
} from './rooms/roomResolver';
import roomMemberSubscriptionFilter from './rooms/roomMemberSubscriptionFilter';
import Rooms from './rooms/RoomDataSource';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import itemUpdatesSubscriptionFilter from './rooms/itemUpdatesSubscriptionFilter';

export interface DataSources {
  Rooms: RoomDataSource;
}

export const ROOM_CHANGED_TOPIC = 'room_changed_topic';
export const ITEM_CHANGED_TOPIC = 'item_changed_topic';
export const ROOM_MEMBER_CHANGED_TOPIC = 'room_member_changed_topic';

const pubSub = new PubSub();

const ROOMS_COLLECTION = 'rooms';
const initMongo = async () => {
  const mongod = new MongoMemoryServer();
  const uri = await mongod.getUri();
  const client = new MongoClient(uri);
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
        roomUpdates: {
          subscribe: async (_, __, {pubSub}) => pubSub.asyncIterator(ROOM_CHANGED_TOPIC)
        },
        itemUpdates: {
          subscribe: withFilter(
            () => pubSub.asyncIterator(ITEM_CHANGED_TOPIC),
            itemUpdatesSubscriptionFilter,
          ),
          resolve: (payload) => payload.item
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
        addRoomBoardItem: addRoomBoardItem
      }
    },
    dataSources: () => ({
      Rooms: new Rooms(mongoClient.db().collection(ROOMS_COLLECTION))
    }),
    context: ({req, connection}) => {
      if (connection) {
        return {
          dataSources: {
            Rooms: new Rooms(mongoClient.db().collection(ROOMS_COLLECTION))
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
