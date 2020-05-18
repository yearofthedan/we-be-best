import {DataSource} from 'apollo-datasource';

interface Room {
  id: string;
  members: string[];
  notes: {
    id: string;
    posY: string;
    posX: string;
    moving: boolean;
  }[];
}

class RoomDataSource extends DataSource {

  getRoom(id: string): Room {
    return {
      id: id,
      members: ['stub'],
      notes: [
        { id: 'ROOM123', posY: '0', posX: '0', moving: false }
      ]
    };
  }
}

export default RoomDataSource;
