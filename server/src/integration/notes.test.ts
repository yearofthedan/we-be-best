import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import testApolloServerAndClient from '../testHelpers/testApolloServerAndClient';
import {
  Note,
  MutationAddRoomBoardNoteArgs,
  MutationDeleteBoardNoteArgs,
  MutationAddMemberArgs,
  MutationLockRoomBoardNoteArgs, MutationUpdateBoardNoteStyleArgs,
  MutationUpdateBoardNoteTextArgs, Room, Subscription,
} from '../../../types/graphql';

describe('integration: notes', () => {
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

  function addAnNoteUpdateSubscription() {
    return new Promise<{ data: Pick<Subscription, 'noteUpdates'> }>((resolve, reject) => {
      apolloClient.subscribe<{ data: Pick<Subscription, 'noteUpdates'> }>({
        query: gql`
            subscription noteUpdates($roomId: ID!) {
                noteUpdates(roomId: $roomId) {
                    id
                    posX
                    posY
                    lockedBy
                    text
                    isDeleted
                    style
                }
            }`,
        variables: {roomId: '123'},
      }).subscribe({
        next: resolve as any,
        error: reject,
      });
    });
  }

  async function addARoom(roomId: string = '123') {
    await apolloClient.mutate<Room, MutationAddMemberArgs>({
      mutation: gql`
          mutation addMember($input: AddMemberInput!) {
              addMember(input: $input)  {
                  id
              }
          }`,
      variables: {
        input: {
          roomId: roomId,
          memberName: 'me',
        },
      },
    });
  }

  async function addAnNoteToARoom() {
    await apolloClient.mutate<Note, MutationAddRoomBoardNoteArgs>({
      mutation: gql`
          mutation addRoomBoardNote($input: AddRoomBoardNoteInput!) {
              addRoomBoardNote(input: $input)  {
                  id
              }
          }`,
      variables: {
        input: {
          roomId: '123',
          noteId: 'note123',
        },
      },
    });
  }

  async function lockAnNoteInARoom() {
    await apolloClient.mutate<Note, MutationLockRoomBoardNoteArgs>({
      mutation: gql`
          mutation lockRoomBoardNote($input: LockRoomBoardNoteInput!) {
              lockRoomBoardNote(input: $input)  {
                  id
              }
          }`,
      variables: {
        input: {
          id: 'note123',
          lockedBy: 'me',
        },
      },
    });
  }

  describe('add note subscription', () => {
    it('sends an update when the note is created for a room I am subscribed to', async function () {
      await addARoom();

      const subscriptionPromise = addAnNoteUpdateSubscription();
      await addAnNoteToARoom();
      const result = await subscriptionPromise;

      expect(result.data.noteUpdates.id).toEqual('note123');
    });
  });

  describe('move note subscription', () => {
    it('sends an update when the note is moved for a room I am subscribed to', async function () {
      await addARoom();
      await addAnNoteToARoom();

      const subscriptionPromise = addAnNoteUpdateSubscription();
      await apolloClient.mutate({
        mutation: gql`
            mutation moveBoardNote($input: MoveBoardNoteInput!) {
                moveBoardNote(input: $input)  {
                    id
                }
            }`,
        variables: {
          input: {
            id: 'note123',
            posX: 10,
            posY: 11,
          },
        },
      });

      const result = await subscriptionPromise;
      expect(result.data.noteUpdates.id).toEqual('note123');
      expect(result.data.noteUpdates.posX).toEqual(10);
      expect(result.data.noteUpdates.posY).toEqual(11);
    });
  });

  describe('lock note subscription', () => {
    it('sends an update when the note is locked for a room I am subscribed to', async function () {
      await addARoom();
      await addAnNoteToARoom();

      const subscriptionPromise = addAnNoteUpdateSubscription();
      await lockAnNoteInARoom();

      const result = await subscriptionPromise;
      expect(result.data.noteUpdates.id).toEqual('note123');
      expect(result.data.noteUpdates.lockedBy).toEqual('me');
    });
  });

  describe('unlock note subscription', () => {
    it('sends an update when the note is unlocked for a room I am subscribed to', async function () {
      await addARoom();
      await addAnNoteToARoom();
      await lockAnNoteInARoom();

      const subscriptionPromise = addAnNoteUpdateSubscription();
      await apolloClient.mutate({
        mutation: gql`
            mutation unlockRoomBoardNote($input: UnlockRoomBoardNoteInput!) {
                unlockRoomBoardNote(input: $input)  {
                    id
                }
            }`,
        variables: {
          input: {
            id: 'note123',
          },
        },
      });

      const result = await subscriptionPromise;
      expect(result.data.noteUpdates.id).toEqual('note123');
      expect(result.data.noteUpdates.lockedBy).toEqual(null);
    });
  });

  describe('update note text subscription', () => {
    it('sends an update when the note text is updated for a room I am subscribed to', async function () {
      await addARoom();
      await addAnNoteToARoom();

      const subscriptionPromise = addAnNoteUpdateSubscription();
      await apolloClient.mutate<Note, MutationUpdateBoardNoteTextArgs>({
        mutation: gql`
            mutation updateBoardNoteText($input: UpdateBoardNoteTextInput!) {
                updateBoardNoteText(input: $input)  {
                    id
                }
            }`,
        variables: {
          input: {
            id: 'note123',
            text: 'some-text'
          },
        },
      });

      const result = await subscriptionPromise;
      expect(result.data.noteUpdates.id).toEqual('note123');
      expect(result.data.noteUpdates.text).toEqual('some-text');
    });
  });

  describe('update note style subscription', () => {
    it('sends an update when the note style is updated for a room I am subscribed to', async function () {
      await addARoom();
      await addAnNoteToARoom();

      const subscriptionPromise = addAnNoteUpdateSubscription();
      await apolloClient.mutate<Note, MutationUpdateBoardNoteStyleArgs>({
        mutation: gql`
            mutation updateBoardNoteStyle($input: UpdateBoardNoteStyleInput!) {
                updateBoardNoteStyle(input: $input)  {
                    id
                }
            }`,
        variables: {
          input: {
            id: 'note123',
            style: 4
          },
        },
      });

      const result = await subscriptionPromise;
      expect(result.data.noteUpdates.id).toEqual('note123');
      expect(result.data.noteUpdates.style).toEqual(4);
    });
  });

  describe('delete note subscription', () => {
    it('sends an update when the note is deleted for a room I am subscribed to', async function () {
      await addARoom();
      await addAnNoteToARoom();

      const subscriptionPromise = addAnNoteUpdateSubscription();
      await apolloClient.mutate<Note, MutationDeleteBoardNoteArgs>({
        mutation: gql`
            mutation deleteBoardNote($id: ID!) {
                deleteBoardNote(id: $id)  {
                    id
                    isDeleted
                }
            }`,
        variables: {
          id: 'note123',
        },
      });

      const result = await subscriptionPromise;
      expect(result.data.noteUpdates.id).toEqual('note123');
      expect(result.data.noteUpdates.isDeleted).toEqual(true);
    });
  });
});
