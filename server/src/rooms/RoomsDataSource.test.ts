import {Collection} from 'apollo-datasource-mongodb';
import {Db, MongoClient} from 'mongodb';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {UserInputError} from 'apollo-server-express';
import {buildNoteModel, buildRoomMemberModel, buildRoomModel} from '@/testHelpers/storedTestDataBuilder';
import RoomsDataSource, {NewNoteParam, RoomModel, UpdateNoteParam} from './RoomsDataSource';

const ROOMS_COLLECTION = 'rooms';
const buildNewNoteParam = (overrides: Partial<NewNoteParam> = {}): NewNoteParam => ({
  id: 'note1',
  posX: 0,
  posY: 0,
  text: 'some text',
  ...overrides
});
const buildUpdateNoteParam = (overrides: Partial<UpdateNoteParam> = {}): UpdateNoteParam => ({
  id: 'note1',
  posX: 0,
  posY: 0,
  text: 'some text',
  ...overrides
});

describe('RoomsDataSource', () => {
  let rooms: RoomsDataSource;
  let connection: MongoClient;
  let db: Db;
  let roomsCollection: Collection<RoomModel>;

  beforeAll(async () => {
    connection = await MongoClient.connect(await new MongoMemoryServer().getUri(), { useUnifiedTopology: true });
    db = await connection.db();
    roomsCollection = await db.createCollection(ROOMS_COLLECTION);
    await roomsCollection.createIndex({'notes.id': 1});
  });

  beforeEach(async () => {
    await roomsCollection.deleteMany({});
    rooms = new RoomsDataSource(roomsCollection);
  });

  afterAll( () => {
    return connection.close(true);
  });

  describe('getRoom', () => {
    it('gets a room when it exists', async () => {
      const existingRoomModel = buildRoomModel(
        {
          id: 'ROOM_123',
          members: [buildRoomMemberModel({ name: 'me'})]
        }
      );
      await roomsCollection.insertOne(existingRoomModel);

      const roomModel = await rooms.getRoom('ROOM_123');

      expect(roomModel).toEqual(existingRoomModel);
    });

    it('does not return deleted notes', async () => {
      const deletedNote = buildNoteModel({ id: '1', isDeleted: true });
      const activeNote = buildNoteModel({id: '2'});
      const activeNoteWithIsDeletedKey = buildNoteModel({ isDeleted: undefined, id: '3', });
      const existingRoomModel = buildRoomModel({
        id: 'ROOM_123',
        members: [buildRoomMemberModel({ name: 'me'})],
        notes: [deletedNote, activeNote]
      });
      await roomsCollection.insertOne(existingRoomModel);

      const roomModel = await rooms.getRoom('ROOM_123');

      expect(roomModel.notes).toContainEqual(activeNote);
      expect(roomModel.notes).not.toContainEqual(deletedNote);
      expect(roomModel.notes).not.toContainEqual(activeNoteWithIsDeletedKey);
    });

    it('throws an error if the room is not there', async () => {
      const expectedError = new UserInputError('could not find room', { invalidArgs: ['id']});

      await expect(rooms.getRoom('UNKNOWN_ROOM')).rejects.toThrow(expectedError);
    });
  });

  describe('addNote', () => {
    it('adds a note', async () => {
      const room = buildRoomModel({id: 'ROOM_123', notes: []});
      await roomsCollection.insertOne({...room});
      const noteParams = buildNewNoteParam({
        id: 'NOTE_123',
        posX: 10,
        posY: 20,
        text: 'some text'
      });

      const noteModel = await rooms.addNote(room.id, noteParams);

      expect(noteModel).toEqual({
        id: noteParams.id,
        posX: noteParams.posX,
        posY: noteParams.posY,
        text: noteParams.text,
        room: room.id,
        lockedBy: null,
      });
    });
  });

  describe('updateNote', () => {
    it('updates an existing note', async () => {
      const existingNoteModel = buildNoteModel({id: 'NOTE_123', room: 'ROOM_123'});
      const room = buildRoomModel({id: 'ROOM_123', notes: [existingNoteModel]});
      await roomsCollection.insertOne({...room});

      const noteParams = buildUpdateNoteParam({
        id: 'NOTE_123',
        text: 'YOLO',
        posX: 100,
        posY: 300,
      });

      const noteModel = await rooms.updateNote(noteParams);

      expect(noteModel).toEqual({
        ...existingNoteModel,
        text: noteParams.text,
        posX: 100,
        posY: 300,
      });
    });

    it('does not overwrite undefined keys', async () => {
      const existingNoteModel = buildNoteModel({id: 'NOTE_123', room: 'ROOM_123'});
      const room = buildRoomModel({id: 'ROOM_123', notes: [existingNoteModel]});
      await roomsCollection.insertOne({...room});

      const noteParams = buildUpdateNoteParam({
        id: 'NOTE_123',
        text: 'YOLO',
        posX: undefined,
        posY: undefined,
      });

      const noteModel = await rooms.updateNote(noteParams);

      expect(noteModel).toEqual({
        ...existingNoteModel,
        text: noteParams.text
      });
    });

    it('does overwrite null keys', async () => {
      const existingNoteModel = buildNoteModel({id: 'NOTE_123', room: 'ROOM_123'});
      const room = buildRoomModel({id: 'ROOM_123', notes: [existingNoteModel]});
      await roomsCollection.insertOne({...room});

      const noteParams = buildUpdateNoteParam({
        id: 'NOTE_123',
        text: null,
        posX: null,
        posY: null,
      });

      const noteModel = await rooms.updateNote(noteParams);

      expect(noteModel).toEqual({
        ...existingNoteModel,
        text: null,
        posX: null,
        posY: null,
      });
    });

    it('updates the correct note in the list', async () => {
      const existingNoteModelFirst = buildNoteModel({id: 'NOTE_1', room: 'ROOM_123'});
      const existingNoteModelSecond = buildNoteModel({id: 'NOTE_2', room: 'ROOM_123'});
      const existingNoteModelThird = buildNoteModel({id: 'NOTE_3', room: 'ROOM_123'});

      const room = buildRoomModel(
        {id: 'ROOM_123', notes: [existingNoteModelFirst, existingNoteModelSecond, existingNoteModelThird]}
      );
      await roomsCollection.insertOne({...room});

      const noteParams = buildUpdateNoteParam({
        id: 'NOTE_2',
        text: 'interesting',
        posX: undefined, posY: undefined,
      });

      const noteModel = await rooms.updateNote(noteParams);

      expect(noteModel).toEqual({
        ...existingNoteModelSecond,
        text: 'interesting',
      });
    });

    it('throws an error if the note is not there', async () => {
      await roomsCollection.insertOne(buildRoomModel({id: 'ROOM_123', notes: [buildNoteModel()]}));
      const noteParams = buildUpdateNoteParam({ id: 'UNKNOWN_NOTE' });

      const expectedError = new UserInputError('could not find note to update', { invalidArgs: ['id']});
      await expect(rooms.updateNote(noteParams)).rejects.toThrow(expectedError);
    });
  });

  describe('deleteNote', () => {
    it('deletes an existing note', async () => {
      const existingNoteModel = buildNoteModel({id: 'NOTE_123', room: 'ROOM_123'});
      const room = buildRoomModel({id: 'ROOM_123', notes: [existingNoteModel]});
      await roomsCollection.insertOne({...room});

      const noteModel = await rooms.deleteNote('NOTE_123');

      expect(noteModel).toEqual({
        ...existingNoteModel,
        isDeleted: true
      });
    });

    it('throws an error if the note is not there', async () => {
      await roomsCollection.insertOne(buildRoomModel({id: 'ROOM_123', notes: [buildNoteModel()]}));

      const expectedError = new UserInputError('could not find note to update', { invalidArgs: ['id']});
      await expect(rooms.deleteNote('UNKNOWN_NOTE')).rejects.toThrow(expectedError);
    });
  });

  describe('addMember', () => {
    it('adds a member to an existing room', async () => {
      const existingRoomModel = buildRoomModel({
        id: 'ROOM_123',
        members: [buildRoomMemberModel({ name: 'me'})]
      });
      await roomsCollection.insertOne(existingRoomModel);

      const memberModel = await rooms.addMember(existingRoomModel.id, 'my-mum');

      expect(memberModel).toEqual({
        id: expect.any(String),
        name: 'my-mum',
        room: 'ROOM_123'
      });
    });

    it('creates the room if it does not exist', async () => {
      const memberModel = await rooms.addMember('new-room', 'my-mum');

      expect(memberModel).toEqual({
        id: expect.any(String),
        name: 'my-mum',
        room: 'new-room'
      });
    });
  });
});
