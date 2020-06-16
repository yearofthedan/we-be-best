import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import testApolloServerAndClient from '../testHelpers/testApolloServerAndClient';
import {JoinRoomInput, RoomItemUpdatesSubscriptionData} from '../../../spa/src/components/Room/roomGraphQLQuery';
import {AddRoomBoardItemInput, ItemResult, RoomResult} from '../rooms/queryDefinitions';
import {LockRoomBoardItemInput} from '../../../spa/src/components/Room/boardItemsGraphQL';

describe('integration: items', () => {
  let apolloClient: ApolloClient<any>;
  let stop: () => void;

  beforeAll(async () => {
    const serverAndClient = await testApolloServerAndClient();
    apolloClient = serverAndClient.client;
    stop = serverAndClient.stop;
  });

  afterAll(() => {
    stop();
  });

  function addAnItemUpdateSubscription() {
    return new Promise<{ data: RoomItemUpdatesSubscriptionData }>((resolve, reject) => {
      apolloClient.subscribe<{ data: RoomItemUpdatesSubscriptionData }>({
        query: gql`
            subscription itemUpdates($roomId: ID!) {
                itemUpdates(roomId: $roomId) {
                    id
                    posX
                    posY
                    lockedBy
                }
            }`,
        variables: {roomId: '123'},
      }).subscribe({
        next: resolve as any,
        error: reject,
      });
    });
  }

  async function addARoom(roomName: string = '123') {
    await apolloClient.mutate<RoomResult, { input: JoinRoomInput }>({
      mutation: gql`
          mutation joinRoom($input: JoinRoomInput!) {
              joinRoom(input: $input)  {
                  id
              }
          }`,
      variables: {
        input: {
          roomName: roomName,
          memberName: 'me',
        },
      },
    });
  }

  async function addAnItemToARoom() {
    await apolloClient.mutate<ItemResult, { input: AddRoomBoardItemInput }>({
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
        },
      },
    });
  }

  async function lockAnItemInARoom() {
    await apolloClient.mutate<ItemResult, { input: LockRoomBoardItemInput }>({
      mutation: gql`
          mutation lockRoomBoardItem($input: LockRoomBoardItemInput!) {
              lockRoomBoardItem(input: $input)  {
                  id
              }
          }`,
      variables: {
        input: {
          id: 'item123',
          lockedBy: 'me',
        },
      },
    });
  }

  describe('add item subscription', () => {
    it('sends an update when the item is created for a room I am subscribed to', async function () {
      const subscriptionPromise = addAnItemUpdateSubscription();
      await addARoom();
      await addAnItemToARoom();
      const result = await subscriptionPromise;

      expect(result.data.itemUpdates.id).toEqual('item123');
    });
  });

  describe('move item subscription', () => {
    it('sends an update when the item is moved for a room I am subscribed to', async function () {
      const subscriptionPromise = addAnItemUpdateSubscription();
      await addARoom();
      await addAnItemToARoom();
      await apolloClient.mutate({
        mutation: gql`
            mutation moveBoardItem($input: MoveBoardItemInput!) {
                moveBoardItem(input: $input)  {
                    id
                }
            }`,
        variables: {
          input: {
            id: 'item123',
            posX: 10,
            posY: 10,
          },
        },
      });

      const result = await subscriptionPromise;
      expect(result.data.itemUpdates.id).toEqual('item123');
    });
  });

  describe('lock item subscription', () => {
    it('sends an update when the item is locked for a room I am subscribed to', async function () {
      const subscriptionPromise = addAnItemUpdateSubscription();
      await addARoom();
      await addAnItemToARoom();
      await lockAnItemInARoom();

      const result = await subscriptionPromise;
      expect(result.data.itemUpdates.id).toEqual('item123');
    });
  });

  describe('unlock item subscription', () => {
    it('sends an update when the item is unlocked for a room I am subscribed to', async function () {
      const subscriptionPromise = addAnItemUpdateSubscription();
      await addARoom();
      await addAnItemToARoom();
      await lockAnItemInARoom();

      await apolloClient.mutate({
        mutation: gql`
            mutation unlockRoomBoardItem($input: UnlockRoomBoardItemInput!) {
                unlockRoomBoardItem(input: $input)  {
                    id
                }
            }`,
        variables: {
          input: {
            id: 'item123',
          },
        },
      });

      const result = await subscriptionPromise;
      expect(result.data.itemUpdates.id).toEqual('item123');
    });
  });
});
