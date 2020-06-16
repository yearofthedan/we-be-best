import {MongoDataSource} from 'apollo-datasource-mongodb';
import {ItemInput} from './roomResolver';

export interface RoomModel {
  _id: string;
  id: string;
  members: string[];
  items: ItemModel[];
}

export interface ItemModel {
  id: string;
  posY: number;
  posX: number;
  text: string;
  lockedBy?: string;
  room: string;
}

export type NewItemParam = Pick<ItemModel, 'id'|'posX'|'posY'|'text'>
export type UpdateItemParam = Partial<ItemModel> & Pick<ItemModel, 'id'>;
export type NewMemberParam = string;

const buildItem = ({id, posX, posY, text, lockedBy, room}: ItemInput & { room: string }): ItemModel => ({
  id,
  posX,
  posY,
  text,
  room,
  lockedBy,
});

type ValueOf<T> = T[keyof T];

class RoomsDataSource extends MongoDataSource<RoomModel> {
  async getRoom(id: string): Promise<RoomModel> {
    const room = await this.collection.findOne({id});

    if (!room) {
      throw new Error('No room found');
    }

    return room;
  }

  async updateItem(item: ItemInput): Promise<ItemModel> {
    const updateSpecification = Object.entries(item)
      .filter(([, value]) => value !== undefined)
      .reduce(
        (accumulator: { [key: string]: keyof ItemModel }, [key, value]: [string, ValueOf<ItemModel>]) => ({
          ...accumulator,
          [`items.$.${[key]}`]: value,
        }),
        {},
      );

    const result = await this.collection.findOneAndUpdate(
      {
        'items.id': item.id
      },
      {$set: updateSpecification},
      {
        projection: { items: 1 },
        returnOriginal: false,
      },
    );

    return result.value.items.find(i => i.id === item.id);
  }

  async addItem(roomId: string, item: NewItemParam): Promise<ItemModel> {
    const result = await this.collection.findOneAndUpdate(
      {id: roomId},
      {$push: {items: buildItem({...item, room: roomId})}},
      {
        projection: {
          items: {
            $elemMatch: {id: item.id},
          },
        },
        returnOriginal: false,
      },
    );

    return result.value.items[0];
  }

  async addMember(roomId: string, member: NewMemberParam): Promise<RoomModel> {
    return (await this.collection.findOneAndUpdate(
      {id: roomId},
      {
        $push: {members: member},
        $setOnInsert: {items: []},
      },
      {
        upsert: true,
        returnOriginal: false,
      },
    )).value;
  }
}

export default RoomsDataSource;
