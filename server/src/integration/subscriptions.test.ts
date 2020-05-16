import * as http from 'http';
import expressApp from '../expressServer';
import initialiseApollo from '../app';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import ws from 'ws';

const GRAPHQL_ENDPOINT = 'ws://localhost:7575/graphql';

describe('integration: subscription', () => {
  let server: http.Server = undefined;
  let apolloClient: ApolloClient<any>;

  beforeEach(function(done) {
    server = http.createServer(expressApp);
    initialiseApollo(server, expressApp);
    const client = new SubscriptionClient(GRAPHQL_ENDPOINT, {
      reconnect: true
    }, ws);

    apolloClient = new ApolloClient({
      link: new WebSocketLink(client),
      cache: new InMemoryCache()
    });

    server.listen(7575, () => {
      done();
    });
  });

  afterEach(() => {
    apolloClient.stop();
    server.close();
  });

  it('Subscription Test', async function() {
    jest.setTimeout(10000);
    const subscriptionPromise = new Promise((resolve, reject) => {
      apolloClient.subscribe({
        query: gql`
            subscription roomChanged {
                roomChanged {
                    id
                }
            }`
      }).subscribe({
        next: resolve,
        error: reject
      });
    });

    //TODO work out an approach which doesn't require a timeout
    setTimeout(() => {
      apolloClient.mutate({
        mutation: gql`
            mutation roomChanged {
                roomChanged {
                    id
                }
            }`
      });
    }, 1000);

    const result: any = await subscriptionPromise;

    expect(result?.data?.roomChanged?.id).toEqual('123');
  }, 10000);
});
