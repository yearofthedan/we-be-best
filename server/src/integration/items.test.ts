import {createTestClient, ApolloServerTestClient} from 'apollo-server-testing';
import { ApolloServerBase } from 'apollo-server-core';
import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import testApolloServerAndClient from '../testHelpers/testApolloServerAndClient';
import server from '../apolloServer';

describe('integration: items', () => {
  let query: ApolloServerTestClient['query'];
  let apolloClient: ApolloClient<any>;
  let stop: () => void;

  beforeAll(async () => {
    const client = createTestClient(await server() as unknown as ApolloServerBase);
    query = client.query;
    const serverAndClient = await testApolloServerAndClient();
    apolloClient = serverAndClient.client;
    stop = serverAndClient.stop;
  });

  afterAll(() => {
    stop();
  });

  describe('add item subscription', () => {
    it('sends an update when the item is created for a room I am subscribed to', async function() {
      const subscriptionPromise = new Promise((resolve, reject) => {
        apolloClient.subscribe({
          query: gql`
              subscription itemUpdates($roomId: ID!) {
                  itemUpdates(roomId: $roomId) {
                      id
                      posX
                      posY
                      lockedBy
                  }
              }`,
          variables: { roomId: '123'}
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
              mutation addRoomBoardItem($input: AddRoomBoardItemInput!) {
                  addRoomBoardItem(input: $input)  {
                      id
                  }
              }`,
          variables: {
            input: {
              roomId: '123',
              itemId: 'item123',
              posX: 10,
              posY: 10,
            }
          }
        });
      }, 1000);

      const result: any = await subscriptionPromise;
      expect(result.data.itemUpdates.id).toEqual('item123');
    });
  });
});
