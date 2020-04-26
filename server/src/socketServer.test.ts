import {createServer, Server} from 'http';
import socketServer from './socketServer';
import client from 'socket.io-client';
import {GATHERING_JOINED} from './onGatheringJoined';
import {GATHERING_CREATED} from './onGatheringCreated';

describe('socketServer', function() {
  let httpServer: Server = undefined;

  beforeEach(done => {
    httpServer = createServer(() => console.log(' -/- '));
    socketServer(httpServer);
    httpServer.listen(7575, () => {
      done();
    });
  });

  afterEach(done => {
    httpServer.on('close', () => {
      done();
    }).close(() => {
      httpServer.unref();
    });
    httpServer.emit('close');
  });

  it('Creates a gathering and lets me join it', (done) => {
    const wsClient = client('http://localhost:7575/');
    wsClient.on('connection', () => console.log('Client connected'));
    wsClient.on(GATHERING_JOINED, (data: any) => {
      expect(data).toEqual(JSON.stringify({ id: 'ROOM1', name: 'Juan' }));
      done();
    });

    wsClient.emit(GATHERING_CREATED, JSON.stringify({ id: 'ROOM1' }));
    wsClient.emit(GATHERING_JOINED, JSON.stringify({ id: 'ROOM1', name: 'Juan' }));
  });
});
