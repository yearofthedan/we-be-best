import {PubSub} from 'apollo-server-express';
import {DataSources, ROOM_MEMBER_CHANGED_TOPIC} from '../apolloServer';
import {JoinRoomInput, Room} from '@type-definitions/graphql';
import {RoomModel} from '@/rooms/RoomsDataSource';

const mapToRoomResponse = (roomModel: RoomModel): Room => {
  return {
    id: roomModel.id,
    members: roomModel.members,
    items: roomModel.items.map(
      ({ room, ...rest}) => ({
        ...rest,
        room: {
          id: room
        } as Room
      }))
  };
};

export const resolveRoom = async (
  _: unknown,
  {id}: { id: string },
  {dataSources}: { dataSources: Pick<DataSources, 'Rooms'> },
): Promise<Room | undefined> => {
  const roomModel = await dataSources.Rooms.getRoom(id);

  return mapToRoomResponse(roomModel);
};

export const joinRoom = async (
  _: unknown,
  {input}: { input: JoinRoomInput },
  {dataSources, pubSub}: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub },
): Promise<Room | undefined> => {
  const roomModel = await dataSources.Rooms.addMember(input.roomName, input.memberName);

  const result = mapToRoomResponse(roomModel);
  await pubSub.publish(ROOM_MEMBER_CHANGED_TOPIC, result);

  return result;
};
