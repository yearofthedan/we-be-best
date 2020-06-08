import {DataSources, ROOM_CHANGED_TOPIC, ROOM_MEMBER_CHANGED_TOPIC} from '../apolloServer';
import {PubSub} from 'apollo-server-express';
import {
  AddRoomBoardItemInput,
  LockRoomBoardItemInput, UnlockRoomBoardItemInput,
  UpdateRoomBoardItemsInput,
} from '../../../spa/src/components/Room/boardItemsGraphQL';
import {
  JoinRoomInput,
} from '../../../spa/src/components/Room/roomGraphQLQuery';
interface Room {
  id: string;
  members: string[];
}

export const addRoomBoardItem = async (
  _: unknown,
  { input }: { input: AddRoomBoardItemInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Room'>; pubSub: PubSub }
): Promise<Room> => {
  const result = await dataSources.Room.addItem(input);
  await pubSub.publish(ROOM_CHANGED_TOPIC, {
    roomUpdates: result
  });
  return result;
};

export const lockRoomBoardItem = async (
  _: unknown,
  { input }: { input: LockRoomBoardItemInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Room'>; pubSub: PubSub }
): Promise<Room> => {
  const result = await dataSources.Room.lockItem(input);
  await pubSub.publish(ROOM_CHANGED_TOPIC, {
    roomUpdates: result
  });
  return result;
};

export const unlockRoomBoardItem = async (
  _: unknown,
  { input }: { input: UnlockRoomBoardItemInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Room'>; pubSub: PubSub }
): Promise<Room> => {
  const result = await dataSources.Room.unlockItem(input);
  await pubSub.publish(ROOM_CHANGED_TOPIC, {
    roomUpdates: result
  });
  return result;
};

export const updateRoomBoardItems = async (
  _: unknown,
  { input }: { input: UpdateRoomBoardItemsInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Room'>; pubSub: PubSub }
): Promise<Room> => {
  const result = await dataSources.Room.updateItems(input);
  await pubSub.publish(ROOM_CHANGED_TOPIC, {
    roomUpdates: result
  });
  return result;
};

const resolveRoom = async (
  _: unknown,
  { id }: { id: string },
  { dataSources }: { dataSources: Pick<DataSources, 'Room'> }
): Promise<Room | undefined> => {
  return dataSources.Room.getRoom(id);
};

export const joinRoom = async (
  _: unknown,
  { input }: { input: JoinRoomInput },
  { dataSources, pubSub }: { dataSources: Pick<DataSources, 'Room'>; pubSub: PubSub }

): Promise<Room | undefined> => {
  const result = await dataSources.Room.addMember(input.roomName, input.memberName);
  await pubSub.publish(ROOM_MEMBER_CHANGED_TOPIC, result);

  return result;
};

export default resolveRoom;
