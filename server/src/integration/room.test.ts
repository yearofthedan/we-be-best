import * as http from 'http';
import ws from 'ws';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import expressApp from '../expressServer';
import initialiseApollo from '../app';
import {AddressInfo} from 'net';

describe('room updates subscription', () => {
  let server: http.Server = undefined;
  let apolloClient: ApolloClient<any>;

  beforeEach(function(done) {
    server = http.createServer(expressApp);
    initialiseApollo(server, expressApp);
    server.listen(0, () => {
      const address = server.address() as AddressInfo;

      const client = new SubscriptionClient(
        `ws://localhost:${address.port}/graphql`,
        { reconnect: true },
        ws
      );
      apolloClient = new ApolloClient({
        link: new WebSocketLink(client),
        cache: new InMemoryCache()
      });

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
                    items {
                        id
                        posX
                        posX
                        lockedBy
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
    setTimeout(async () => {
      await apolloClient.mutate({
        mutation: gql`
            mutation joinRoom($input: JoinRoomInput!) {
                joinRoom(input: $input)  {
                    id
                }
            }`,
        variables: {
          input: {
            roomName: '123',
            memberName: 'me'
          }
        }
      });

      await apolloClient.mutate({
        mutation: gql`
          mutation updateRoomBoardItems($input: UpdateRoomBoardItemsInput!) {
            updateRoomBoardItems(input: $input)  {
              id
            }
          }`,
        variables: {
          input: {
            id: '123',
            items: [
              {
                id: 'item123',
                posX: 10,
                posY: 10,
                lockedBy: 'me',
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
