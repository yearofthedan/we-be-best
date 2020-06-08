import gql from 'graphql-tag';

export interface RoomData {
  id: string;
  members: string[];
  items: {
    id: string;
    posX: number;
    posY: number;
    lockedBy?: string;
  }[];
}

export interface RoomMemberUpdatesSubscriptionData {
  roomMemberUpdates: Pick<RoomData, 'id' | 'members'>;
}

export interface GetRoomQueryData {
  room: RoomData;
}

export const ROOM_MEMBER_UPDATES_SUBSCRIPTION = gql`
  subscription roomMemberUpdates($id: ID!) {
    roomMemberUpdates(id: $id) {
      id
      members
    }
  }
`;

export const ROOM_UPDATES_SUBSCRIPTION = gql`
  subscription roomUpdates($id: ID!) {
    roomUpdates(id: $id) {
      id
      members
      items {
        id
        posX
        posY
        lockedBy
      }
    }
  }
`;

export const GET_ROOM_QUERY = gql`
  query room($id: ID!) {
    room(id: $id) {
      id
      members
      items {
        id
        posX
        posY
        lockedBy
      }
    }
  }
`;

export interface JoinRoomInput {
  roomName: string;
  memberName: string;
}

export const JOIN_ROOM_MUTATION = gql`
  mutation joinRoom($input: JoinRoomInput!) {
    joinRoom(input: $input) {
      id
      items {
        id
        posX
        posY
        lockedBy
      }
    }
  }
`;
