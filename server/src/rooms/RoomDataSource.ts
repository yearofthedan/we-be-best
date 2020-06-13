import {MongoDataSource} from 'apollo-datasource-mongodb';
import {
  AddRoomBoardItemInput,
  LockRoomBoardItemInput,
  UpdateRoomBoardItemsInput,
} from '../../../spa/src/components/Room/boardItemsGraphQL';
import buildItem from './itemBuilder';

export interface RoomData {
  _id: string;
  id: string;
  members: string[];
  items: {
    id: string;
    posY: number;
    posX: number;
    lockedBy?: string;
  }[];
}

class Rooms extends MongoDataSource<RoomData> {
  async getRoom(id: string): Promise<RoomData> {
    const room = await this.collection.findOne({ id });

    if (!room) {
      throw new Error('No room found');
    }

    return room;
  }

  async updateItems(update: UpdateRoomBoardItemsInput): Promise<RoomData> {
    return (await this.collection.findOneAndUpdate(
      {id: update.id},
      { $set: { items: update.items } },
      {
        returnOriginal: false,
      }
    )).value;
  }


  async addItem({itemId, roomId, posY, posX}: AddRoomBoardItemInput): Promise<RoomData> {
    return (await this.collection.findOneAndUpdate(
      {id: roomId},
      { $push: { items: buildItem({id: itemId, posY, posX}) } },
      {
        returnOriginal: false,
      }
    )).value;
  }

  async addMember(roomId: string, member: string): Promise<RoomData> {
    return (await this.collection.findOneAndUpdate(
      {id: roomId},
      {
        $push: {members: member},
        $setOnInsert: {items: []},
      },
      {
        upsert: true,
        returnOriginal: false,
      }
    )).value;
  }

  async lockItem({itemId, meId, roomId}: LockRoomBoardItemInput): Promise<RoomData> {
     return (await this.collection.findOneAndUpdate(
      {
        id: roomId,
        items: { $elemMatch: { id: itemId } }
      },
      { $set: { 'items.$.lockedBy' : meId } },
      {
        returnOriginal: false
      }
    )).value;
  }

  async unlockItem({itemId, roomId}: LockRoomBoardItemInput): Promise<RoomData> {
    return (await this.collection.findOneAndUpdate(
      {
        id: roomId,
        items: {$elemMatch: {id: itemId}}
      },
      {
        $set: {'items.$.lockedBy': undefined}
        },
      {
        returnOriginal: false
      }
    )).value;
  }
}

export default Rooms;
