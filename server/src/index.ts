import {createServer} from 'http';
import socketServer from './socketServer';

const server = createServer();
socketServer(server);
server.listen(3000);
