import http from 'http';
import expressApp from '../expressServer';
import initialiseApollo from '../app';
import {SubscriptionClient} from 'subscriptions-transport-ws';
import ws from 'ws';
import ApolloClient from 'apollo-client';
import {WebSocketLink} from 'apollo-link-ws';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {AddressInfo} from 'net';


async function httpApolloServer() {
  const server = http.createServer(expressApp);
  await initialiseApollo(server, expressApp);

  const doneMock = jest.fn().mockReturnValue(Promise.resolve());
  server.listen(0, () => {
    doneMock();
  });
  await doneMock;
  return server;
}

const apolloClient = (port: number) => {
  const client = new SubscriptionClient(
    `ws://localhost:${port}/graphql`,
    { reconnect: true },
    ws
  );

  return new ApolloClient({
    link: new WebSocketLink(client),
    cache: new InMemoryCache()
  });
};

async function testApolloServerAndClient() {
  const server = await httpApolloServer();
  const client = apolloClient((server.address() as AddressInfo).port);
  return {
    stop: () => {
      client.stop();
      server.close();
    },
    client: client,
  };
}

export default testApolloServerAndClient;
