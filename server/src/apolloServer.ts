import { ApolloServer, PubSub } from 'apollo-server-express';
import typeDefs from './typeDefs';
import RoomDataSource from './rooms/RoomDataSource';
import resolveRoom from './rooms/roomResolver';

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
            id: '123',
            members: ['stub'],
            notes: [
              { id: 'ROOM123', posY: '0', posX: '0', moving: false }
            ]
          } });
        return {
          id: '123',
          members: ['stub'],
          notes: [
            { id: 'ROOM123', posY: '0', posX: '0', moving: false }
          ]
        };
      },
    }
  },
  dataSources: () => ({
    Room: new RoomDataSource(),
  }),
});

export default apolloServer;
