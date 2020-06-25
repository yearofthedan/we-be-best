import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import testApolloServerAndClient from '../testHelpers/testApolloServerAndClient';
import {
  Item,
  MutationAddRoomBoardItemArgs,
  MutationDeleteBoardItemArgs,
  MutationJoinRoomArgs,
  MutationLockRoomBoardItemArgs,
  MutationUpdateBoardItemTextArgs, Room,
  Subscription,
} from '../../../common/graphql';

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
    return new Promise<{ data: Pick<Subscription, 'itemUpdates'> }>((resolve, reject) => {
      apolloClient.subscribe<{ data: Pick<Subscription, 'itemUpdates'> }>({
        query: gql`
            subscription itemUpdates($roomId: ID!) {
                itemUpdates(roomId: $roomId) {
                    id
                    posX
                    posY
                    lockedBy
                    text
                    isDeleted
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
    await apolloClient.mutate<Room, MutationJoinRoomArgs>({
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
    await apolloClient.mutate<Item, MutationAddRoomBoardItemArgs>({
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
    await apolloClient.mutate<Item, MutationLockRoomBoardItemArgs>({
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
      await addARoom();

      const subscriptionPromise = addAnItemUpdateSubscription();
      await addAnItemToARoom();
      const result = await subscriptionPromise;

      expect(result.data.itemUpdates.id).toEqual('item123');
    });
  });

  describe('move item subscription', () => {
    it('sends an update when the item is moved for a room I am subscribed to', async function () {
      await addARoom();
      await addAnItemToARoom();

      const subscriptionPromise = addAnItemUpdateSubscription();
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
            posY: 11,
          },
        },
      });

      const result = await subscriptionPromise;
      expect(result.data.itemUpdates.id).toEqual('item123');
      expect(result.data.itemUpdates.posX).toEqual(10);
      expect(result.data.itemUpdates.posY).toEqual(11);
    });
  });

  describe('lock item subscription', () => {
    it('sends an update when the item is locked for a room I am subscribed to', async function () {
      await addARoom();
      await addAnItemToARoom();

      const subscriptionPromise = addAnItemUpdateSubscription();
      await lockAnItemInARoom();

      const result = await subscriptionPromise;
      expect(result.data.itemUpdates.id).toEqual('item123');
      expect(result.data.itemUpdates.lockedBy).toEqual('me');
    });
  });

  describe('unlock item subscription', () => {
    it('sends an update when the item is unlocked for a room I am subscribed to', async function () {
      await addARoom();
      await addAnItemToARoom();
      await lockAnItemInARoom();

      const subscriptionPromise = addAnItemUpdateSubscription();
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
      expect(result.data.itemUpdates.lockedBy).toEqual(null);
    });
  });

  describe('update item text subscription', () => {
    it('sends an update when the item text is updated for a room I am subscribed to', async function () {
      await addARoom();
      await addAnItemToARoom();

      const subscriptionPromise = addAnItemUpdateSubscription();
      await apolloClient.mutate<Item, MutationUpdateBoardItemTextArgs>({
        mutation: gql`
            mutation updateBoardItemText($input: UpdateBoardItemTextInput!) {
                updateBoardItemText(input: $input)  {
                    id
                }
            }`,
        variables: {
          input: {
            id: 'item123',
            text: 'some-text'
          },
        },
      });

      const result = await subscriptionPromise;
      expect(result.data.itemUpdates.id).toEqual('item123');
      expect(result.data.itemUpdates.text).toEqual('some-text');
    });
  });

  describe('delete item subscription', () => {
    it('sends an update when the item is deleted for a room I am subscribed to', async function () {
      await addARoom();
      await addAnItemToARoom();

      const subscriptionPromise = addAnItemUpdateSubscription();
      await apolloClient.mutate<Item, MutationDeleteBoardItemArgs>({
        mutation: gql`
            mutation deleteBoardItem($id: ID!) {
                deleteBoardItem(id: $id)  {
                    id
                    isDeleted
                }
            }`,
        variables: {
          id: 'item123',
        },
      });

      const result = await subscriptionPromise;
      expect(result.data.itemUpdates.id).toEqual('item123');
      expect(result.data.itemUpdates.isDeleted).toEqual(true);
    });
  });
});
