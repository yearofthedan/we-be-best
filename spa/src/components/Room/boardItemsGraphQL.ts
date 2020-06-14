import gql from 'graphql-tag';

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
      posX
      posY
      lockedBy
    }
  }
`;

export interface UnlockRoomBoardItemInput {
  id: string;
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

export interface LockRoomBoardItemInput {
  id: string;
  lockedBy: string;
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

export interface ItemInput {
  id: string;
  posX: number;
  posY: number;
  lockedBy?: string;
}

export interface MoveBoardItemInput {
  id: string;
  posX: number;
  posY: number;
}

export const MOVE_BOARD_ITEM_MUTATION = gql`
  mutation moveBoardItem($input: MoveBoardItemInput!) {
    moveBoardItem(input: $input) {
      id
      posX
      posY
      lockedBy
    }
  }
`;
