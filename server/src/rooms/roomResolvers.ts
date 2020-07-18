import {DataSources} from '@/apolloServer';
import {Room} from '@type-definitions/graphql';
import {RoomModel} from '@/rooms/RoomsDataSource';

const mapToRoomResponse = (roomModel: RoomModel): Room => {
  return {
    id: roomModel.id,
    members: roomModel.members.map(
      ({ room, ...rest}) => ({
        ...rest,
        room: {
          id: room
        } as Room
      })),
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
