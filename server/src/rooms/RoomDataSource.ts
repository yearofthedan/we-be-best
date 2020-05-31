import {DataSource} from 'apollo-datasource';
import {LockRoomBoardItemInput, UpdateRoomBoardItemsInput} from '../../../spa/src/components/Room/roomGraphQLQuery';

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

  lockItem(input: LockRoomBoardItemInput): Room {
    const items = roomsData.get(input.roomId).items;
    const itemIndex = roomsData.get(input.roomId).items.findIndex((i => i.id === input.itemId));

    const room = {
      ...roomsData.get(input.roomId),
      items: [
          ...items.slice(0, itemIndex),
          {
            ...items[itemIndex],
            lockedBy: input.meId,
          },
          ...items.slice(itemIndex + 1),
        ]
    };

    roomsData.set(input.roomId, room);
    return room;
  }

  unlockItem(input: LockRoomBoardItemInput): Room {
    const items = roomsData.get(input.roomId).items;
    const itemIndex = roomsData.get(input.roomId).items.findIndex((i => i.id === input.itemId));

    const room = {
      ...roomsData.get(input.roomId),
      items: [
        ...items.slice(0, itemIndex),
        {
          ...items[itemIndex],
          lockedBy: undefined,
        },
        ...items.slice(itemIndex + 1),
      ]
    };

    roomsData.set(input.roomId, room);
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
