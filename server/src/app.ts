import http from 'http';
import {Express} from 'express';
import apolloServer from './apolloServer';

const initialiseApollo = async (
  httpServer: http.Server,
  expressApp: Express
) => {
  try {
    const apollo = await apolloServer();
    apollo.applyMiddleware({app: expressApp});
    apollo.installSubscriptionHandlers(httpServer);
  } catch (e) {
    console.log(e);
  }
};

export default initialiseApollo;
