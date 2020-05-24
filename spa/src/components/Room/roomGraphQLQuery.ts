import gql from 'graphql-tag';

export interface RoomData {
  id: string;
  members: string[];
  notes: {
    id: string;
    posX: number;
    posY: number;
    moving: boolean;
  }[];
}

export const ROOM_UPDATES_SUBSCRIPTION = gql`
  subscription roomUpdates($id: ID!) {
    roomUpdates(id: $id) {
      id
      members
      notes {
        id
        posX
        posY
        moving
      }
    }
  }
`;

export const GET_ROOM_QUERY = gql`
  query room($id: ID!) {
    room(id: $id) {
      id
      members
      notes {
        id
        posX
        posY
        moving
      }
    }
  }
`;

export interface NoteInput {
  id: string;
  posX: number;
  posY: number;
  moving: boolean;
}

export interface UpdateRoomNotesInput {
  id: string;
  notes: NoteInput[];
}

export const UPDATE_ROOM_NOTES_MUTATION = gql`
  mutation updateRoomNotes($input: UpdateRoomNotesInput!) {
    updateRoomNotes(input: $input) {
      id
      notes {
          id
          posX
          posY
          moving
      }
    }
  }
`;
