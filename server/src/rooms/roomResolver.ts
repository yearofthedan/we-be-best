import {PubSub} from 'apollo-server-express';
import {DataSources, ITEM_CHANGED_TOPIC, ROOM_MEMBER_CHANGED_TOPIC} from '../apolloServer';
import {
  AddRoomBoardItemInput,
  LockRoomBoardItemInput, UnlockRoomBoardItemInput,
  MoveBoardItemInput,
} from '../../../spa/src/components/Room/boardItemsGraphQL';
import {
  JoinRoomInput,
} from '../../../spa/src/components/Room/roomGraphQLQuery';
import {ItemResult, RoomResult} from './queryDefinitions';

export interface ItemInput {
  id: string;
  posY?: number;
  posX?: number;
  text?: string;
  lockedBy?: string;
}

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

const resolveRoom = async (
  _: unknown,
  { id }: { id: string },
  { dataSources }: { dataSources: Pick<DataSources, 'Rooms'> }
): Promise<RoomResult | undefined> => {
  const { _id, ...result } = await dataSources.Rooms.getRoom(id);
  return result;
};

export const joinRoom = async (
  _: unknown,
  { input }: { input: JoinRoomInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }

): Promise<RoomResult | undefined> => {
  const { _id, ...result } = await dataSources.Rooms.addMember(input.roomName, input.memberName);
  await pubSub.publish(ROOM_MEMBER_CHANGED_TOPIC, result);

  return result;
};

export default resolveRoom;
