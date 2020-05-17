import gql from 'graphql-tag';

export const GET_ROOM_QUERY = gql`
  query room($id: ID!) {
    room(id: $id) {
      id
      members
    }
  }
`;

interface NoteInput {
  id: string;
  posX: number;
  posY: number;
  moving: boolean;
}

export interface RoomChangedInput {
  notes: [NoteInput]
}

export const ROOM_CHANGED_MUTATION = gql`  
    mutation roomChanged($input: RoomChangedInput!) {
        roomChanged(input: $input)  {
            id
        }
    }
`;
