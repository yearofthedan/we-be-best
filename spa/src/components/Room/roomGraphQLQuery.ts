import gql from 'graphql-tag';

export interface RoomData {
  id: string;
  members: string[];
  items: ItemData[];
}

export interface ItemData {
  id: string;
  posX: number;
  posY: number;
  lockedBy?: string;
  text: string;
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

export interface RoomItemUpdatesSubscriptionData {
  itemUpdates: ItemData;
}

export const ROOM_ITEM_UPDATES_SUBSCRIPTION = gql`
  subscription itemUpdates($roomId: ID!) {
    itemUpdates(roomId: $roomId) {
      id
      posX
      posY
      lockedBy
      text
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
        text
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
        text
      }
    }
  }
`;
