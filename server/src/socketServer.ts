import {Server} from 'http';

import socketIO, {Socket} from 'socket.io';
import Gatherings from './gatherings';
import onGatheringCreated, {GATHERING_CREATED} from './onGatheringCreated';
import onGatheringJoined, {GATHERING_JOINED} from './onGatheringJoined';

export interface ConnectionContext {
  sourceSocket: Socket;
  sendToGroup: (groupName: string, event: string, message: string) => {};
}

const socketServer = (serverToBind: Server) => {
  const gatherings = new Gatherings();

  const wsServer = socketIO(serverToBind);

  wsServer.on('connection', (socket) => {
    const context: ConnectionContext = {
      sourceSocket: socket,
      sendToGroup: (groupName, event, message) => wsServer.to(groupName).emit(event, message)
    };

    console.log('Connected to ', socket.handshake.headers);

    socket.on(GATHERING_CREATED, (rawData) => {
      onGatheringCreated(rawData, gatherings, context);
    });
    socket.on(GATHERING_JOINED, (rawData) => {
      onGatheringJoined(rawData, gatherings, context);
    });
  });
};

export default socketServer;
