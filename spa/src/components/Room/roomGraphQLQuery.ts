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

export interface ItemInput {
  id: string;
  posX: number;
  posY: number;
  lockedBy?: string;
}

export interface UpdateRoomBoardItemsInput {
  id: string;
  items: ItemInput[];
}

export const UPDATE_ROOM_BOARD_ITEM_MUTATION = gql`
  mutation updateRoomBoardItems($input: UpdateRoomBoardItemsInput!) {
    updateRoomBoardItems(input: $input) {
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

export interface LockRoomBoardItemInput {
  roomId: string;
  itemId: string;
  meId: string;
}

export const LOCK_ROOM_BOARD_ITEM_MUTATION = gql`
  mutation lockRoomBoardItem($input: LockRoomBoardItemInput!) {
    lockRoomBoardItem(input: $input) {
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

export interface UnlockRoomBoardItemInput {
  roomId: string;
  itemId: string;
  meId: string;
}

export const UNLOCK_ROOM_BOARD_ITEM_MUTATION = gql`
  mutation unlockRoomBoardItem($input: UnlockRoomBoardItemInput!) {
    unlockRoomBoardItem(input: $input) {
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

export interface AddRoomBoardItemInput {
  roomId: string;
  itemId: string;
  posX: number;
  posY: number;
}

export const ADD_ROOM_BOARD_ITEM_MUTATION = gql`
  mutation addRoomBoardItem($input: AddRoomBoardItemInput!) {
    addRoomBoardItem(input: $input) {
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
