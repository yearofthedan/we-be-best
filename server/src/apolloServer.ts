import { ApolloServer, PubSub } from 'apollo-server-express';
import typeDefs from './typeDefs';
import RoomDataSource from './rooms/RoomDataSource';
import resolveRoom, {updateRoomBoardItems} from './rooms/roomResolver';

export interface DataSources {
  Room: RoomDataSource;
}

export const ROOM_CHANGED_TOPIC = 'room_changed_topic';

const pubSub = new PubSub();

const apolloServer = () => new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      room: resolveRoom,
    },
    Subscription: {
      roomUpdates: {
        subscribe: async (_, __, { pubSub }) => pubSub.asyncIterator(ROOM_CHANGED_TOPIC)
      }
    },
    Mutation: {
      updateRoomBoardItems: updateRoomBoardItems,
    }
  },
  dataSources: () => ({
    Room: new RoomDataSource()
  }),
  context: ({req, connection}) => {
    if (connection) {
      return {
        dataSources:  {
          Room: new RoomDataSource()
        },
        pubSub
      };
    }
    return {
      pubSub
    };
  }
});



export default apolloServer;
