import {DataSources} from './index';

interface Room {
  id: string;
  members: string[];
}

const resolveRoom = async (
  _: unknown,
  __: unknown,
  { dataSources }: { dataSources: Pick<DataSources, 'Room'> }
): Promise<Room | undefined> => {
  return dataSources.Room.getRoom();
};

export default resolveRoom;
