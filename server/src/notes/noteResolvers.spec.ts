import {PubSub} from 'graphql-subscriptions';
import {Collection} from 'apollo-datasource-mongodb';
import {MongoClient} from 'mongodb';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {
  addRoomBoardNote, deleteBoardNote,
  lockRoomBoardNote,
  moveBoardNote,
  unlockRoomBoardNote, updateBoardNoteStyle,
  updateBoardNoteText,
} from './noteResolvers';
import RoomsDataSource, {RoomModel} from '../rooms/RoomsDataSource';
import {NOTE_CHANGED_TOPIC} from '../apolloServer';
import {
  buildAddNoteInput,
  buildLockNoteInput,
  buildUnlockNoteInput, buildUpdateBoardNoteStyleInput,
  buildUpdateBoardNoteTextInput,
  buildUpdateNotesInput,
} from '../testHelpers/queryTestDataBuilder';
import {buildNoteData, buildNoteModel, buildRoomModel} from '../testHelpers/storedTestDataBuilder';

const ROOMS_COLLECTION = 'rooms';

describe('noteResolvers', () => {
  let rooms: RoomsDataSource;
  let connection: MongoClient;
  let roomsCollection: Collection<RoomModel>;

  beforeAll(async () => {
    connection = await MongoClient.connect(await new MongoMemoryServer().getUri(), { useUnifiedTopology: true });
    const db = await connection.db();
    roomsCollection = await db.createCollection(ROOMS_COLLECTION);
    await roomsCollection.createIndex({'notes.id': 1});
  });
  afterAll(async () => {
    await connection.close();
  });
  beforeEach(async () => {
    await roomsCollection.deleteMany({});
    rooms = new RoomsDataSource(roomsCollection);
  });
  describe('updateBoardNoteText', function () {
    it('updates the note text and publishes the update', async () => {
      const existingNoteModel = buildNoteModel({ id: 'note-id'});
      const existingRoomModel = buildRoomModel({id: 'ROOM_123', notes: [existingNoteModel]});
      await roomsCollection.insertOne(existingRoomModel);
      const noteInput = buildUpdateBoardNoteTextInput({ text: 'yolo', id: existingNoteModel.id });
      const publishStub = jest.fn();

      const result = await updateBoardNoteText(
        undefined,
        { input: noteInput },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      const expected = { ...existingNoteModel, room: { id: existingNoteModel.room }, text: 'yolo' };
      expect(result).toEqual(expected);
      expect(publishStub).toHaveBeenCalledWith(NOTE_CHANGED_TOPIC, expected);
    });
  });
  describe('updateBoardNoteStyle', function () {
    it('updates the note style and publishes the update', async () => {
      const existingNoteModel = buildNoteModel({ id: 'note-id', style: 0});
      const existingRoomModel = buildRoomModel({id: 'ROOM_123', notes: [existingNoteModel]});
      await roomsCollection.insertOne(existingRoomModel);
      const noteInput = buildUpdateBoardNoteStyleInput({ style: 4, id: existingNoteModel.id });
      const publishStub = jest.fn();

      const result = await updateBoardNoteStyle(
        undefined,
        { input: noteInput },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      const expected = { ...existingNoteModel, room: { id: existingNoteModel.room }, style: 4 };
      expect(result).toEqual(expected);
      expect(publishStub).toHaveBeenCalledWith(NOTE_CHANGED_TOPIC, expected);
    });
  });
  describe('addRoomBoardNote', () => {
    it('adds the note and publishes the update', async () => {
      const room = buildRoomModel({id: 'ROOM_123', notes: []});
      await roomsCollection.insertOne({...room});
      const noteInput = buildAddNoteInput({roomId: 'ROOM_123', noteId: 'NOTE_123' });
      const publishStub = jest.fn();
      const result = await addRoomBoardNote(
        undefined,
        { input: noteInput },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      expect(result).toEqual({
        id: noteInput.noteId,
        posX: noteInput.posX,
        posY: noteInput.posY,
        lockedBy: null,
        text: '',
        room: { id: 'ROOM_123' },
      });
      expect(publishStub).toHaveBeenCalledWith(NOTE_CHANGED_TOPIC, {
        id: noteInput.noteId,
        posX: noteInput.posX,
        posY: noteInput.posY,
        lockedBy: null,
        text: '',
        room: { id: 'ROOM_123' },
      });
    });
  });
  describe('lockRoomBoardNote', () => {
    it('locks the note and publishes the update', async () => {
      const publishStub = jest.fn();
      const existingNoteModel = buildNoteModel({ id: 'note-id', room: 'ROOM_123' });
      const existingRoomModel = buildRoomModel({id: 'ROOM_123', notes: [existingNoteModel]});
      await roomsCollection.insertOne(existingRoomModel);

      const result = await lockRoomBoardNote(
        undefined,
        {
          input: buildLockNoteInput({id: 'note-id', lockedBy: 'me' })
        },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      const expected = { ...existingNoteModel, room: { id: existingNoteModel.room }, lockedBy: 'me' };

      expect(result).toEqual(expected);
      expect(publishStub).toHaveBeenCalledWith(NOTE_CHANGED_TOPIC, expected);
    });
  });
  describe('unlockRoomBoardNote', () => {
    it('unlocks the note', async () => {
      const roomNoteData = buildNoteData({ id: 'note-id', lockedBy: 'me'});
      const room = buildRoomModel({notes: [roomNoteData]});
      await roomsCollection.insertOne({...room});

      const result = await unlockRoomBoardNote(
        undefined,
        {
          input: buildUnlockNoteInput({ id: roomNoteData.id })
        },
        {
          pubSub: { publish: jest.fn(), dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      const expected = { ...roomNoteData, room: { id: roomNoteData.room }, lockedBy: null as string };

      expect(result).toEqual(expected);
    });

    it('publishes an update when the note is unlocked', async () => {
      const publishStub = jest.fn();
      const roomNoteData = buildNoteData({ id: 'note-id', lockedBy: 'me'});
      const room = buildRoomModel({notes: [roomNoteData]});
      await roomsCollection.insertOne({...room});

      const result = await unlockRoomBoardNote(
        undefined,
        {
          input: buildUnlockNoteInput({ id: roomNoteData.id })
        },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      expect(publishStub).toHaveBeenCalledWith(NOTE_CHANGED_TOPIC, result);
    });
  });
  describe('moveBoardNote', () => {
    it('updates the note', async () => {
      const existingNoteModel = buildNoteData({ id: 'note1'});
      const room = buildRoomModel({id: 'ROOM_123', notes: [existingNoteModel]});
      await roomsCollection.insertOne({...room});
      const result = await moveBoardNote(
        undefined,
        {
          input: buildUpdateNotesInput({ id: 'note1', posX: 100, posY: 33 }),
        },
        {
          pubSub: { publish: jest.fn(), dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      const expected = { ...existingNoteModel, room: { id: existingNoteModel.room }, posX: 100, posY: 33 };
      expect(result).toEqual(expected);
    });

    it('publishes an update after updating', async () => {
      const existingNoteModel = buildNoteData({ id: 'note1'});
      const room = buildRoomModel({ notes: [existingNoteModel]});
      await roomsCollection.insertOne({...room});
      const publishStub = jest.fn();

      await moveBoardNote(
        undefined,
        {
          input: buildUpdateNotesInput({ id: 'note1', posX: 100, posY: 33 }),
        },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      const expected = { ...existingNoteModel, room: { id: existingNoteModel.room }, posX: 100, posY: 33 };
      expect(publishStub).toHaveBeenCalledWith(NOTE_CHANGED_TOPIC, expected);

    });
  });
  describe('deleteBoardNote', () => {
    it('deletes the note', async () => {
      const existingNoteModel = buildNoteData({ id: 'note1'});
      const room = buildRoomModel({id: 'ROOM_123', notes: [existingNoteModel]});
      await roomsCollection.insertOne({...room});
      const result = await deleteBoardNote(
        undefined,
        { id: 'note1' },
        {
          pubSub: { publish: jest.fn(), dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      const expected = { ...existingNoteModel, room: { id: existingNoteModel.room }, isDeleted: true };
      expect(result).toEqual(expected);
    });

    it('publishes an update after deleting', async () => {
      const existingNoteModel = buildNoteData({ id: 'note1'});
      const room = buildRoomModel({ notes: [existingNoteModel]});
      await roomsCollection.insertOne({...room});
      const publishStub = jest.fn();

      await deleteBoardNote(
        undefined,
        { id: 'note1' },
        {
          pubSub: { publish: publishStub, dataSource: {Rooms: rooms} } as unknown as PubSub,
          dataSources: {Rooms: rooms},
        },
      );

      const expected = { ...existingNoteModel, room: { id: existingNoteModel.room }, isDeleted: true };
      expect(publishStub).toHaveBeenCalledWith(NOTE_CHANGED_TOPIC, expected);
    });
  });
});
