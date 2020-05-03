import {ApolloServer} from 'apollo-server';
import typeDefs from './typeDefs';
import RoomDataSource from './RoomDataSource';
import resolveRoom from './roomResolver';

const port = process.env.PORT || 3000;

export interface DataSources {
  Room: RoomDataSource;
}

const initialise = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers: {
      Query: {
        room: resolveRoom
      }
    },
    dataSources: () => ({
      Room: new RoomDataSource()
    }),
  });

  await server.listen({port});
};

initialise().then(() => {
  console.log(`🚀 Server is running on localhost: ${port}`);
});
