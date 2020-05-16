import { ApolloServer, PubSub } from 'apollo-server-express';
import typeDefs from './typeDefs';
import RoomDataSource from './RoomDataSource';
import resolveRoom from './roomResolver';

export interface DataSources {
  Room: RoomDataSource;
}

const pubsub = new PubSub();

const apolloServer = () => new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      room: resolveRoom,
    },
    Subscription: {
      roomChanged: {
        subscribe: async () =>  pubsub.asyncIterator('room_changed_topic')
      }
    },
    Mutation: {
      roomChanged: async () => {
        await pubsub.publish('room_changed_topic', { roomChanged: {
          id: '123'
          } });
        return {
          id: '123'
        };
      },
    }
  },
  dataSources: () => ({
    Room: new RoomDataSource(),
  }),
});

export default apolloServer;
