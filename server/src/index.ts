import initialiseApollo from './app';
import * as http from 'http';
import expressApp from './expressServer';

const port = process.env.PORT || 3000;

const httpServer = http.createServer(expressApp);

initialiseApollo(httpServer, expressApp).then(() => {
  httpServer.listen({port});
  console.log(`🚀 Server is running on localhost: ${port}`);
});
