import {DataSource} from 'apollo-datasource';
import {UpdateRoomNotesInput} from '../../../spa/src/components/Room/roomGraphQLQuery';

export interface Room {
  id: string;
  members: string[];
  notes: {
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
  notes: [{
    id: 'note1',
    posY: 0,
    posX: 0,
    moving: false
  }]
});

class RoomDataSource extends DataSource {
  updateNotes(update: UpdateRoomNotesInput): Room {
    const room = {
      ...roomsData.get(update.id),
      notes: update.notes
    };

    roomsData.set(update.id, room);
    return room;
  }

  getRoom(id: string): Room {
    return roomsData.get(id);
  }
}

export default RoomDataSource;
