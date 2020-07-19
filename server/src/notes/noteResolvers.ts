import {PubSub} from 'apollo-server-express';
import {DataSources, NOTE_CHANGED_TOPIC} from '../apolloServer';
import {
  Note,
  MutationAddRoomBoardNoteArgs,
  MutationDeleteBoardNoteArgs,
  MutationLockRoomBoardNoteArgs,
  MutationMoveBoardNoteArgs,
  MutationUnlockRoomBoardNoteArgs, MutationUpdateBoardNoteStyleArgs,
  MutationUpdateBoardNoteTextArgs, Room,
} from '@type-definitions/graphql';
import {NoteModel} from '@/rooms/RoomsDataSource';

const mapToNoteResponse = ({ room, ...rest}: NoteModel): Note => ({
  ...rest,
  room: {
    id: room
  } as Room
});

export const addRoomBoardNote = async (
  _: unknown,
  { input }: MutationAddRoomBoardNoteArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<Note> => {
  const { noteId, roomId, posX, posY, text, style } = input;
  const noteModel = await dataSources.Rooms.addNote(roomId, { id: noteId, posY, posX, text, style });
  const result = mapToNoteResponse(noteModel);

  await pubSub.publish(NOTE_CHANGED_TOPIC, result);
  return result;
};

export const updateBoardNoteText = async (
  _: unknown,
  { input }: MutationUpdateBoardNoteTextArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<Note> => {
  const noteModel = await dataSources.Rooms.updateNote({ id: input.id, text: input.text});
  const result = mapToNoteResponse(noteModel);

  await pubSub.publish(NOTE_CHANGED_TOPIC, result);
  return result;
};

export const updateBoardNoteStyle = async (
  _: unknown,
  { input }: MutationUpdateBoardNoteStyleArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<Note> => {
  const noteModel = await dataSources.Rooms.updateNote({ id: input.id, style: input.style});
  const result = mapToNoteResponse(noteModel);

  await pubSub.publish(NOTE_CHANGED_TOPIC, result);
  return result;
};

export const lockRoomBoardNote = async (
  _: unknown,
  { input }: MutationLockRoomBoardNoteArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<Note> => {
  const noteModel = await dataSources.Rooms.updateNote({ id: input.id, lockedBy: input.lockedBy});
  const result = mapToNoteResponse(noteModel);

  await pubSub.publish(NOTE_CHANGED_TOPIC, result);
  return result;
};

export const unlockRoomBoardNote = async (
  _: unknown,
  { input }: MutationUnlockRoomBoardNoteArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<Note> => {
  const noteModel = await dataSources.Rooms.updateNote({ id: input.id, lockedBy: null});
  const result = mapToNoteResponse(noteModel);

  await pubSub.publish(NOTE_CHANGED_TOPIC, result);
  return result;
};

export const moveBoardNote = async (
  _: unknown,
  { input }: MutationMoveBoardNoteArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<Note> => {
  const noteModel = await dataSources.Rooms.updateNote({ id: input.id, posX: input.posX, posY: input.posY});
  const result = mapToNoteResponse(noteModel);

  await pubSub.publish(NOTE_CHANGED_TOPIC, result);
  return result;
};

export const deleteBoardNote = async (
  _: unknown,
  { id }: MutationDeleteBoardNoteArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<Note> => {
  const noteModel = await dataSources.Rooms.deleteNote(id);
  const result = mapToNoteResponse(noteModel);

  await pubSub.publish(NOTE_CHANGED_TOPIC, result);
  return result;
};
