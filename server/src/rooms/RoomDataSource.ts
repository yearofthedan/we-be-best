import {MongoDataSource} from 'apollo-datasource-mongodb';
import {
  AddRoomBoardItemInput,
  LockRoomBoardItemInput, UnlockRoomBoardItemInput,
  UpdateRoomBoardItemsInput,
} from '../../../spa/src/components/Room/boardItemsGraphQL';
import buildItem from './itemBuilder';

export interface RoomData {
  _id: string;
  id: string;
  members: string[];
  items: ItemData[];
}

export interface ItemData {
  id: string;
  posY: number;
  posX: number;
  lockedBy?: string;
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


  async addItem({itemId, roomId, posY, posX}: AddRoomBoardItemInput): Promise<ItemData> {
    const result = await this.collection.findOneAndUpdate(
      {id: roomId},
      { $push: { items: buildItem({id: itemId, posY, posX}) } },
      {
        projection: {
          items: {
            $elemMatch: {id: itemId},
          }
        },
        returnOriginal: false,
      }
    );

    return result.value.items[0];
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

  async lockItem({id, lockedBy}: LockRoomBoardItemInput): Promise<RoomData> {
     return (await this.collection.findOneAndUpdate(
      {
        'items.id': id,
        items: { $elemMatch: { id } }
      },
      { $set: { 'items.$.lockedBy' : lockedBy } },
      {
        returnOriginal: false
      }
    )).value;
  }

  async unlockItem({id}: UnlockRoomBoardItemInput): Promise<RoomData> {
    return (await this.collection.findOneAndUpdate(
      {
        'items.id': id,
        items: { $elemMatch: { id } }
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
