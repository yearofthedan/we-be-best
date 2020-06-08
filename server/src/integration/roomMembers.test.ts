import {createTestClient} from 'apollo-server-testing';
import server from '../apolloServer';
import {JOIN_ROOM_MUTATION} from '../../../spa/src/components/Room/roomGraphQLQuery';
import http from 'http';
import ApolloClient from 'apollo-client';
import expressApp from '../expressServer';
import initialiseApollo from '../app';
import {SubscriptionClient} from 'subscriptions-transport-ws';
import ws from 'ws';
import {WebSocketLink} from 'apollo-link-ws';
import {InMemoryCache} from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import {AddressInfo} from 'net';

const { query } = createTestClient(server());

describe('integration: room members', () => {
  describe('room members subscription', () => {
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

    it('sends an update when the members change for a room I am subscribed to', async function() {
      const subscriptionPromise = new Promise((resolve, reject) => {
        apolloClient.subscribe({
          query: gql`
              subscription roomMemberUpdates($id: ID!) {
                  roomMemberUpdates(id: $id) {
                      id
                      members
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
      }, 1000);

      const result: any = await subscriptionPromise;
      expect(result?.data?.roomMemberUpdates?.id).toEqual('123');
    });
  });

  it('joins the room', async () => {
    const res = await query({
      query: JOIN_ROOM_MUTATION,
      variables: { input: { roomName: 'my-room',  memberName: 'me' } }
    });

    expect(res.data).toHaveProperty('joinRoom', {
      id: 'my-room',
      items: []
    });
  });
});
