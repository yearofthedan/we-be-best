import {PubSub} from 'apollo-server-express';
import {DataSources, ITEM_CHANGED_TOPIC} from '../apolloServer';
import {
  Item,
  MutationAddRoomBoardItemArgs,
  MutationDeleteBoardItemArgs,
  MutationLockRoomBoardItemArgs,
  MutationMoveBoardItemArgs,
  MutationUnlockRoomBoardItemArgs, MutationUpdateBoardItemStyleArgs,
  MutationUpdateBoardItemTextArgs, Room,
} from '@type-definitions/graphql';
import {ItemModel} from '@/rooms/RoomsDataSource';

const mapToItemResponse = ({ room, ...rest}: ItemModel): Item => ({
  ...rest,
  room: {
    id: room
  } as Room
});

export const addRoomBoardItem = async (
  _: unknown,
  { input }: MutationAddRoomBoardItemArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<Item> => {
  const { itemId, roomId, posX, posY } = input;
  const itemModel = await dataSources.Rooms.addItem(roomId, { id: itemId, posY, posX, text: ''});
  const result = mapToItemResponse(itemModel);

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);
  return result;
};

export const updateBoardItemText = async (
  _: unknown,
  { input }: MutationUpdateBoardItemTextArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<Item> => {
  const itemModel = await dataSources.Rooms.updateItem({ id: input.id, text: input.text});
  const result = mapToItemResponse(itemModel);

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);
  return result;
};

export const updateBoardItemStyle = async (
  _: unknown,
  { input }: MutationUpdateBoardItemStyleArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<Item> => {
  const itemModel = await dataSources.Rooms.updateItem({ id: input.id, style: input.style});
  const result = mapToItemResponse(itemModel);

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);
  return result;
};

export const lockRoomBoardItem = async (
  _: unknown,
  { input }: MutationLockRoomBoardItemArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<Item> => {
  const itemModel = await dataSources.Rooms.updateItem({ id: input.id, lockedBy: input.lockedBy});
  const result = mapToItemResponse(itemModel);

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);
  return result;
};

export const unlockRoomBoardItem = async (
  _: unknown,
  { input }: MutationUnlockRoomBoardItemArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<Item> => {
  const itemModel = await dataSources.Rooms.updateItem({ id: input.id, lockedBy: null});
  const result = mapToItemResponse(itemModel);

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);
  return result;
};

export const moveBoardItem = async (
  _: unknown,
  { input }: MutationMoveBoardItemArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<Item> => {
  const itemModel = await dataSources.Rooms.updateItem({ id: input.id, posX: input.posX, posY: input.posY});
  const result = mapToItemResponse(itemModel);

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);
  return result;
};

export const deleteBoardItem = async (
  _: unknown,
  { id }: MutationDeleteBoardItemArgs,
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<Item> => {
  const itemModel = await dataSources.Rooms.deleteItem(id);
  const result = mapToItemResponse(itemModel);

  await pubSub.publish(ITEM_CHANGED_TOPIC, result);
  return result;
};
