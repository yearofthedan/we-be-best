import {createTestClient, ApolloServerTestClient} from 'apollo-server-testing';
import {ApolloServerBase} from 'apollo-server-core';
import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import testApolloServerAndClient from '../testHelpers/testApolloServerAndClient';
import server from '../apolloServer';
// @ts-ignore
import {addMember} from '../../../spa/src/graphql/roomQueries.graphql';
import {sleep} from '../testHelpers/timeout';

const STUB_UUID = '11111-11111-1111-1111';

jest.mock('uuid', () => ({
  v4: () => { return STUB_UUID; }
}));

describe('integration: room members', () => {
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

  describe('room members subscription', () => {
    it('sends an update when the members change for a room I am subscribed to', async function () {
      const subscriptionPromise = new Promise((resolve, reject) => {
        apolloClient.subscribe({
          query: gql`
              subscription memberUpdates($id: ID!) {
                  memberUpdates(roomId: $id) {
                      id
                      name
                  }
              }`,
          variables: {id: '123'},
        }).subscribe({
          next: resolve,
          error: reject,
        });
      });
      await sleep(1000);
      await apolloClient.mutate({
        mutation: gql`
            mutation addMember($input: AddMemberInput!) {
                addMember(input: $input)  {
                    id
                }
            }`,
        variables: {
          input: {
            roomId: '123',
            memberName: 'me',
          },
        },
      });

      const result: any = await subscriptionPromise;
      expect(result?.data?.memberUpdates?.id).toEqual(STUB_UUID);
    });
  });

  it('joins the room', async () => {
    const res = await query({
      query: addMember,
      variables: {input: {roomId: 'my-room', memberName: 'me'}},
    });

    expect(res.data).toHaveProperty('addMember', {
      __typename: 'Member',
      id: STUB_UUID,
      name: 'me',
      room: {
        id: 'my-room'
      },
    });
  });
});
