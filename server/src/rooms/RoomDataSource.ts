import {DataSource} from 'apollo-datasource';
import {UpdateRoomBoardItemsInput} from '../../../spa/src/components/Room/roomGraphQLQuery';

export interface Room {
  id: string;
  members: string[];
  items: {
    id: string;
    posY: number;
    posX: number;
    lockedBy?: string;
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
  }]
});

class RoomDataSource extends DataSource {
  addMember(id: string, member: string): Room {
    if (!roomsData.get(id)) {
      this.createRoom(id);
    }

    const room = {
      ...roomsData.get(id),
      members: [...this.getRoom(id).members, member]
    };

    roomsData.set(id, room);
    return room;
  }

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

  private createRoom(id: string): Room {
    return roomsData.set(id, { id, members: [], items: [] }).get(id);
  }

  clear() {
    roomsData.clear();
  }
}

export default RoomDataSource;
