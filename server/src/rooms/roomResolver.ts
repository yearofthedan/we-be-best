import {PubSub} from 'apollo-server-express';
import {DataSources, ITEM_CHANGED_TOPIC, ROOM_CHANGED_TOPIC, ROOM_MEMBER_CHANGED_TOPIC} from '../apolloServer';
import {
  AddRoomBoardItemInput,
  LockRoomBoardItemInput, UnlockRoomBoardItemInput,
  UpdateRoomBoardItemsInput,
} from '../../../spa/src/components/Room/boardItemsGraphQL';
import {
  JoinRoomInput,
} from '../../../spa/src/components/Room/roomGraphQLQuery';
import {ItemResult, RoomResult} from './queryDefinitions';

export const addRoomBoardItem = async (
  _: unknown,
  { input }: { input: AddRoomBoardItemInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<ItemResult> => {
  const result = await dataSources.Rooms.addItem(input);
  await pubSub.publish(ITEM_CHANGED_TOPIC, {
    item: result,
    roomId: input.roomId
  });
  return result;
};

export const lockRoomBoardItem = async (
  _: unknown,
  { input }: { input: LockRoomBoardItemInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<RoomResult> => {
  const { _id, ...result } = await dataSources.Rooms.lockItem(input);
  await pubSub.publish(ROOM_CHANGED_TOPIC, {
    roomUpdates: result
  });
  return result;
};

export const unlockRoomBoardItem = async (
  _: unknown,
  { input }: { input: UnlockRoomBoardItemInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<RoomResult> => {
  const { _id, ...result } = await dataSources.Rooms.unlockItem(input);
  await pubSub.publish(ROOM_CHANGED_TOPIC, {
    roomUpdates: result
  });
  return result;
};

export const updateRoomBoardItems = async (
  _: unknown,
  { input }: { input: UpdateRoomBoardItemsInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub }
): Promise<RoomResult> => {
  const { _id, ...result } = await dataSources.Rooms.updateItems(input);
  await pubSub.publish(ROOM_CHANGED_TOPIC, {
    roomUpdates: result
  });
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
