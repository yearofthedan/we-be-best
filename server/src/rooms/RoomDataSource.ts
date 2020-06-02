import {DataSource} from 'apollo-datasource';
import {
  AddRoomBoardItemInput,
  LockRoomBoardItemInput,
  UpdateRoomBoardItemsInput,
} from '../../../spa/src/components/Room/roomGraphQLQuery';
import buildItem from './itemBuilder';

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

class RoomDataSource extends DataSource {
  getRoom(id: string): Room {
    if (!roomsData.get(id)) {
      throw new Error('No room found');
    }
    return roomsData.get(id);
  }

  addItem({ itemId, roomId, posY, posX}: AddRoomBoardItemInput): Room {
    return this.updateItems({
      id: roomId,
      items: [
        ...this.getRoom(roomId).items,
        buildItem({id: itemId, posY, posX})
      ]
    });
  }

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

  private createRoom(id: string): Room {
    return roomsData.set(id, { id, members: [], items: [] }).get(id);
  }

  clear() {
    roomsData.clear();
  }
}

export default RoomDataSource;
