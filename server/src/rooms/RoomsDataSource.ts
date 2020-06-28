import {MongoDataSource} from 'apollo-datasource-mongodb';
import {UserInputError} from 'apollo-server-express';

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
  isDeleted?: boolean;
  style?: number;
}

export type NewItemParam = Pick<ItemModel, 'id'|'posX'|'posY'|'text'>
export type UpdateItemParam = Partial<ItemModel> & Pick<ItemModel, 'id'>;
export type NewMemberParam = string;

const buildItem = ({id, posX, posY, text, lockedBy, room}: ItemModel): ItemModel => ({
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
      throw new UserInputError('could not find room', { invalidArgs: ['id']});
    }

    const items = room.items.filter(item => !item.isDeleted);
    return { ...room, items };
  }

  async deleteItem(itemId: string): Promise<ItemModel> {
    const result = await this.collection.findOneAndUpdate(
      {
        'items.id': itemId
      },
      {$set: { 'items.$.isDeleted': true }},
      {
        projection: { items: 1 },
        returnOriginal: false,
      },
    );

    if (result.value === null) {
      throw new UserInputError('could not find item to update', { invalidArgs: ['id']});
    }

    return result.value.items.find(i => i.id === itemId);
  }

  async updateItem(item: UpdateItemParam): Promise<ItemModel> {
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

    if (result.value === null) {
      throw new UserInputError('could not find item to update', { invalidArgs: ['id']});
    }

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
