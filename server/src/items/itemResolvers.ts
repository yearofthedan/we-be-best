import {PubSub} from 'apollo-server-express';
import {DataSources, ITEM_CHANGED_TOPIC} from '../apolloServer';
import {
  AddRoomBoardItemInput,
  LockRoomBoardItemInput,
  MoveBoardItemInput,
  UnlockRoomBoardItemInput,
  UpdateBoardItemTextInput,
  ItemResult,
} from './queryDefinitions';

export const addRoomBoardItem = async (
  _: unknown,
  { input }: { input: AddRoomBoardItemInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<ItemResult> => {
  const { itemId, roomId, posX, posY } = input;
  const result = await dataSources.Rooms.addItem(roomId, { id: itemId, posY, posX, text: ''});

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);

  return result;
};

export const updateBoardItemText = async (
  _: unknown,
  { input }: { input: UpdateBoardItemTextInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<ItemResult> => {
  const result = await dataSources.Rooms.updateItem({ id: input.id, text: input.text});

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);

  return result;
};

export const lockRoomBoardItem = async (
  _: unknown,
  { input }: { input: LockRoomBoardItemInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<ItemResult> => {
  const result = await dataSources.Rooms.updateItem({ id: input.id, lockedBy: input.lockedBy});

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);

  return result;
};

export const unlockRoomBoardItem = async (
  _: unknown,
  { input }: { input: UnlockRoomBoardItemInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<ItemResult> => {
  const result = await dataSources.Rooms.updateItem({ id: input.id, lockedBy: null});

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);

  return result;
};

export const moveBoardItem = async (
  _: unknown,
  { input }: { input: MoveBoardItemInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<ItemResult> => {
  const result = await dataSources.Rooms.updateItem({ id: input.id, posX: input.posX, posY: input.posY});

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);

  return result;
};

export const deleteBoardItem = async (
  _: unknown,
  { id }: { id: string },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<ItemResult> => {
  const result = await dataSources.Rooms.deleteItem(id);
  await pubSub.publish(ITEM_CHANGED_TOPIC, result);

  return result;
};
