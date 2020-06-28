import {PubSub} from 'apollo-server-express';
import {DataSources, ITEM_CHANGED_TOPIC} from '../apolloServer';
import {ItemResult} from './queryDefinitions';
import {
  MutationAddRoomBoardItemArgs,
  MutationDeleteBoardItemArgs,
  MutationLockRoomBoardItemArgs,
  MutationMoveBoardItemArgs,
  MutationUnlockRoomBoardItemArgs, MutationUpdateBoardItemStyleArgs,
  MutationUpdateBoardItemTextArgs,
} from '@type-definitions/graphql';

export const addRoomBoardItem = async (
  _: unknown,
  { input }: MutationAddRoomBoardItemArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<ItemResult> => {
  const { itemId, roomId, posX, posY } = input;
  const result = await dataSources.Rooms.addItem(roomId, { id: itemId, posY, posX, text: ''});

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);

  return result;
};

export const updateBoardItemText = async (
  _: unknown,
  { input }: MutationUpdateBoardItemTextArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<ItemResult> => {
  const result = await dataSources.Rooms.updateItem({ id: input.id, text: input.text});

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);

  return result;
};

export const updateBoardItemStyle = async (
  _: unknown,
  { input }: MutationUpdateBoardItemStyleArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<ItemResult> => {
  const result = await dataSources.Rooms.updateItem({ id: input.id, style: input.style});

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);

  return result;
};

export const lockRoomBoardItem = async (
  _: unknown,
  { input }: MutationLockRoomBoardItemArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<ItemResult> => {
  const result = await dataSources.Rooms.updateItem({ id: input.id, lockedBy: input.lockedBy});

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);

  return result;
};

export const unlockRoomBoardItem = async (
  _: unknown,
  { input }: MutationUnlockRoomBoardItemArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<ItemResult> => {
  const result = await dataSources.Rooms.updateItem({ id: input.id, lockedBy: null});

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);

  return result;
};

export const moveBoardItem = async (
  _: unknown,
  { input }: MutationMoveBoardItemArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<ItemResult> => {
  const result = await dataSources.Rooms.updateItem({ id: input.id, posX: input.posX, posY: input.posY});

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);

  return result;
};

export const deleteBoardItem = async (
  _: unknown,
  { id }: MutationDeleteBoardItemArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<ItemResult> => {
  const result = await dataSources.Rooms.deleteItem(id);
  await pubSub.publish(ITEM_CHANGED_TOPIC, result);

  return result;
};
