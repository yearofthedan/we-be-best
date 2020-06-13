import {ApolloServer, PubSub, withFilter} from 'apollo-server-express';
import typeDefs from './typeDefs';
import RoomDataSource from './rooms/RoomDataSource';
import resolveRoom, {
  addRoomBoardItem,
  joinRoom,
  lockRoomBoardItem,
  unlockRoomBoardItem,
  updateRoomBoardItems,
} from './rooms/roomResolver';
import roomMemberSubscriptionFilter from './rooms/roomMemberSubscriptionFilter';
import Rooms from './rooms/RoomDataSource';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

export interface DataSources {
  Rooms: RoomDataSource;
}

export const ROOM_CHANGED_TOPIC = 'room_changed_topic';
export const ROOM_MEMBER_CHANGED_TOPIC = 'room_member_changed_topic';

const pubSub = new PubSub();

const initMongo = async () => {
  const mongod = new MongoMemoryServer();
  const uri = await mongod.getUri();
  const client = new MongoClient(uri);
  await client.connect();
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
        updateRoomBoardItems: updateRoomBoardItems,
        addRoomBoardItem: addRoomBoardItem
      }
    },
    dataSources: () => ({
      Rooms: new Rooms(mongoClient.db().collection('rooms'))
    }),
    context: ({req, connection}) => {
      if (connection) {
        return {
          dataSources: {
            Rooms: new Rooms(mongoClient.db().collection('rooms'))
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
