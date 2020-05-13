import server from './server';
import express from 'express';
import path from 'path';
import * as http from 'http';

const app = express();
const port = process.env.PORT || 3000;
const spaPath = process.env.SPA_PATH || path.join(__dirname, '../../spa/dist');

app.use('/', express.static(spaPath));

server.applyMiddleware({app});

const initialise = async () => {
  await app.listen({port});
};

initialise().then(() => {
  console.log(`🚀 Server is running on localhost: ${port}`);
});


app.use('/', express.static(spaPath));

server.applyMiddleware({app});

const initialise = async () => {
  await app.listen({port});
  try {
    const httpServer = http.createServer(app);

    const ser = await server();
    ser.applyMiddleware({app});
    ser.installSubscriptionHandlers(httpServer);
    await httpServer.listen({port});
  } catch (e) {
    console.log(e);
  }
};

initialise().then(() => {
