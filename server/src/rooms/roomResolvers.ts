import {PubSub} from 'apollo-server-express';
import {DataSources, ROOM_MEMBER_CHANGED_TOPIC} from '../apolloServer';
import {JoinRoomInput} from '../../../common/graphql';
import {RoomResult} from './queryDefinitions';

export const resolveRoom = async (
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
