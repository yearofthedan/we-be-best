import {DataSources} from './apolloServer';

interface Room {
  id: string;
  members: string[];
}

const resolveRoom = async (
  _: unknown,
  { id }: { id: string },
  { dataSources }: { dataSources: Pick<DataSources, 'Room'> }
): Promise<Room | undefined> => {
  return dataSources.Room.getRoom(id);
};

export default resolveRoom;
