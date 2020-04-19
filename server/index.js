const Websocket = require('ws');

const wss = new Websocket.Server({ port: 8081 }, null);

const sockets = new Map();

wss.on('connection', function(socket, req) {
  const ip = req.connection.remoteAddress;
  console.log('Opened connection for' + ip);

  sockets.set(ip, socket);

  // Send data back to the client
  const json = JSON.stringify({ message: 'Gotcha' });
  socket.send(json);

  // When data is received
  socket.on('message', function(message) {
    console.log('Received: ' + message);
  });

  // The connection was closed
  socket.on('close', function() {
    console.log('Closed Connection ');
  });

});

// Every three seconds broadcast "{ message: 'Hello hello!' }" to all connected clients
const broadcast = function() {
  const json = JSON.stringify({
    message: 'Hello hello!'
  });

  // wss.clients is an array of all connected clients
  wss.clients.forEach(function each(client) {
    console.log(JSON.stringify(client));
    client.send(json);
    console.log('Sent: ' + json);
  });
};
setInterval(broadcast, 10000);
