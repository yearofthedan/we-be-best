import {ApolloServer} from 'apollo-server';
import typeDefs from './typeDefs';
import RoomDataSource from './RoomDataSource';
import resolveRoom from './roomResolver';

export interface DataSources {
  Room: RoomDataSource;
}

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      room: resolveRoom,
    },
  },
  dataSources: () => ({
    Room: new RoomDataSource(),
  }),
});

export default server;
