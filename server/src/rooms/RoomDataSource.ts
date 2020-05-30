import {DataSource} from 'apollo-datasource';
import {UpdateRoomBoardItemsInput} from '../../../spa/src/components/Room/roomGraphQLQuery';

export interface Room {
  id: string;
  members: string[];
  items: {
    id: string;
    posY: number;
    posX: number;
    moving: boolean;
  }[];
}

const roomsData = new Map<string, Room>();
roomsData.set('123', {
  id: '123',
  members: ['person123'],
  items: [{
    id: 'item1',
    posY: 0,
    posX: 0,
    moving: false
  }]
});

class RoomDataSource extends DataSource {
  updateItems(update: UpdateRoomBoardItemsInput): Room {
    const room = {
      ...roomsData.get(update.id),
      items: update.items
    };

    roomsData.set(update.id, room);
    return room;
  }

  getRoom(id: string): Room {
    return roomsData.get(id);
  }
}

export default RoomDataSource;
