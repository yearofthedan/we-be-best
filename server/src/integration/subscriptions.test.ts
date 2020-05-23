import * as http from 'http';
import ws from 'ws';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import expressApp from '../expressServer';
import initialiseApollo from '../app';

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
    const subscriptionPromise = new Promise((resolve, reject) => {
      apolloClient.subscribe({
        query: gql`
            subscription roomUpdates($id: ID!) {
                roomUpdates(id: $id) {
                    id
                    members
                    notes {
                        id
                        posX
                        posX
                        moving
                    }
                }
            }`,
        variables: { id: '123'}
      }).subscribe({
        next: resolve,
        error: reject
      });
    });
    //TODO work out an approach which doesn't require a timeout
    setTimeout(() => {
      apolloClient.mutate({
        mutation: gql`
          mutation updateRoomNotes($input: UpdateRoomNotesInput!) {
            updateRoomNotes(input: $input)  {
              id
            }
          }`,
        variables: {
          input: {
            id: '123',
            notes: [
              {
                id: 'note123',
                posX: 10,
                posY: 10,
                moving: true
              }
            ]
          }
        }
      });
    }, 1000);

    const result: any = await subscriptionPromise;
    expect(result?.data?.roomUpdates?.id).toEqual('123');
  });
});
