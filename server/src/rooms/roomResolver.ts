import {DataSources, ROOM_CHANGED_TOPIC} from '../apolloServer';
import {PubSub} from 'apollo-server-express';
import {UpdateRoomBoardItemsInput} from '../../../spa/src/components/Room/roomGraphQLQuery';

interface Room {
  id: string;
  members: string[];
}

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

export default resolveRoom;
