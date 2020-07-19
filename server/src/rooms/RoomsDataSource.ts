import {MongoDataSource} from 'apollo-datasource-mongodb';
import {UserInputError} from 'apollo-server-express';
import { v4 } from 'uuid';

export interface RoomModel {
  _id: string;
  id: string;
  members: MemberModel[];
  notes: NoteModel[];
}

export interface MemberModel {
  id: string;
  name: string;
  room: string;
}

export interface NoteModel {
  id: string;
  posY: number;
  posX: number;
  text: string;
  room: string;
  lockedBy?: string;
  isDeleted?: boolean;
  style?: number;
}

export type NewNoteParam = Pick<NoteModel, 'id'|'posX'|'posY'|'text'>
export type UpdateNoteParam = Partial<NoteModel> & Pick<NoteModel, 'id'>;

const buildNote = ({id, posX, posY, text, lockedBy, room}: NoteModel): NoteModel => ({
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

    const notes = room.notes.filter(note => !note.isDeleted);
    return { ...room, notes };
  }

  async deleteNote(noteId: string): Promise<NoteModel | undefined> {
    const result = await this.collection.findOneAndUpdate(
      {
        'notes.id': noteId
      },
      {$set: { 'notes.$.isDeleted': true }},
      {
        projection: { notes: 1 },
        returnOriginal: false,
      },
    );

    if (result.value === null) {
      throw new UserInputError('could not find note to update', { invalidArgs: ['id']});
    }

    return result.value?.notes.find(i => i.id === noteId);
  }

  async updateNote(note: UpdateNoteParam): Promise<NoteModel> {
    const updateSpecification = Object.entries(note)
      .filter(([, value]) => value !== undefined)
      .reduce(
        // @ts-ignore //todo this is erroring on SPA build needs investigation
        (accumulator: { [key: string]: keyof NoteModel }, [key, value]: [string, ValueOf<NoteModel>]) => ({
          ...accumulator,
          [`notes.$.${[key]}`]: value,
        }),
        {},
      );

    const result = await this.collection.findOneAndUpdate(
      {
        'notes.id': note.id
      },
      {$set: updateSpecification},
      {
        projection: { notes: 1 },
        returnOriginal: false,
      },
    );

    if (result.value === null) {
      throw new UserInputError('could not find note to update', { invalidArgs: ['id']});
    }

    return result.value?.notes.find(i => i.id === note.id) as NoteModel;
  }

  async addNote(roomId: string, note: NewNoteParam): Promise<NoteModel | undefined> {
    const result = await this.collection.findOneAndUpdate(
      {id: roomId},
      {$push: {notes: buildNote({...note, room: roomId})}},
      {
        projection: {
          notes: {
            $elemMatch: {id: note.id},
          },
        },
        returnOriginal: false,
      },
    );

    return result.value?.notes[0];
  }

  async addMember(roomId: string, memberName: string): Promise<MemberModel | undefined> {
    const member: MemberModel = {
      id: v4(),
      name: memberName,
      room: roomId,
    };

    return (await this.collection.findOneAndUpdate(
      {id: roomId},
      { $push: {members: member}, $setOnInsert: {notes: []} },
      {
        projection: {
          members: {
            $elemMatch: {id: member.id},
          },
        },
        upsert: true,
        returnOriginal: false,
      },
    )).value?.members[0];
  }
}

export default RoomsDataSource;
