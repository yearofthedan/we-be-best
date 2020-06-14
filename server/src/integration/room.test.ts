import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import testApolloServerAndClient from '../testHelpers/testApolloServerAndClient';

describe('room updates subscription', () => {
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
                        posY
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
