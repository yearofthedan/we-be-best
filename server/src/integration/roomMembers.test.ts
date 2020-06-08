import {createTestClient} from 'apollo-server-testing';
import server from '../apolloServer';
import {JOIN_ROOM_MUTATION} from '../../../spa/src/components/Room/roomGraphQLQuery';
import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import testApolloServerAndClient from '../testHelpers/testApolloServerAndClient';

const { query } = createTestClient(server());

describe('integration: room members', () => {
  describe('room members subscription', () => {
    let apolloClient: ApolloClient<any>;
    let stop: () => void;

    beforeEach(async () => {
      const serverAndClient = await testApolloServerAndClient();
      apolloClient = serverAndClient.client;
      stop = serverAndClient.stop;
    });

    afterEach(() => {
      stop();
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
