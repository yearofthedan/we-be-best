export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type ItemInput = {
  id: Scalars['String'];
  posX: Scalars['Int'];
  posY: Scalars['Int'];
  lockedBy?: Maybe<Scalars['String']>;
};

export type MoveBoardItemInput = {
  id: Scalars['String'];
  posX: Scalars['Int'];
  posY: Scalars['Int'];
};

export type LockRoomBoardItemInput = {
  id: Scalars['ID'];
  lockedBy: Scalars['ID'];
};

export type UnlockRoomBoardItemInput = {
  id: Scalars['ID'];
};

export type UpdateBoardItemTextInput = {
  id: Scalars['ID'];
  text: Scalars['String'];
};

export type AddRoomBoardItemInput = {
  roomId: Scalars['ID'];
  itemId: Scalars['String'];
  posX: Scalars['Int'];
  posY: Scalars['Int'];
};

export type JoinRoomInput = {
  roomName: Scalars['ID'];
  memberName: Scalars['String'];
};

export type Room = {
  __typename?: 'Room';
  id: Scalars['ID'];
  members: Array<Scalars['String']>;
  items: Array<Item>;
};

export type Item = {
  __typename?: 'Item';
  id: Scalars['String'];
  posX: Scalars['Int'];
  posY: Scalars['Int'];
  lockedBy?: Maybe<Scalars['String']>;
  room?: Maybe<Room>;
  text: Scalars['String'];
  isDeleted?: Maybe<Scalars['Boolean']>;
};

export type Query = {
  __typename?: 'Query';
  room?: Maybe<Room>;
};


export type QueryRoomArgs = {
  id: Scalars['ID'];
};

export type Subscription = {
  __typename?: 'Subscription';
  roomMemberUpdates: Room;
  itemUpdates: Item;
};


export type SubscriptionRoomMemberUpdatesArgs = {
  id: Scalars['ID'];
};


export type SubscriptionItemUpdatesArgs = {
  roomId: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  joinRoom: Room;
  moveBoardItem: Item;
  lockRoomBoardItem: Item;
  unlockRoomBoardItem: Item;
  addRoomBoardItem: Item;
  updateBoardItemText: Item;
  deleteBoardItem: Item;
};


export type MutationJoinRoomArgs = {
  input: JoinRoomInput;
};


export type MutationMoveBoardItemArgs = {
  input: MoveBoardItemInput;
};


export type MutationLockRoomBoardItemArgs = {
  input: LockRoomBoardItemInput;
};


export type MutationUnlockRoomBoardItemArgs = {
  input: UnlockRoomBoardItemInput;
};


export type MutationAddRoomBoardItemArgs = {
  input: AddRoomBoardItemInput;
};


export type MutationUpdateBoardItemTextArgs = {
  input: UpdateBoardItemTextInput;
};


export type MutationDeleteBoardItemArgs = {
  id: Scalars['ID'];
};
