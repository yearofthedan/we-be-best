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

export type UpdateBoardItemStyleInput = {
  id: Scalars['ID'];
  style: Scalars['Int'];
};

export type AddRoomBoardItemInput = {
  roomId: Scalars['ID'];
  itemId: Scalars['String'];
  posX: Scalars['Int'];
  posY: Scalars['Int'];
};

export type JoinRoomInput = {
  roomId: Scalars['ID'];
  memberName: Scalars['String'];
};

export type Room = {
  __typename?: 'Room';
  id: Scalars['ID'];
  members: Array<Member>;
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
  style?: Maybe<Scalars['Int']>;
};

export type Member = {
  __typename?: 'Member';
  id: Scalars['ID'];
  name: Scalars['String'];
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
  updateBoardItemStyle: Item;
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


export type MutationUpdateBoardItemStyleArgs = {
  input: UpdateBoardItemStyleInput;
};


export type MutationDeleteBoardItemArgs = {
  id: Scalars['ID'];
};

export type ItemBitsFragment = (
  { __typename: 'Item' }
  & Pick<Item, 'id' | 'posX' | 'posY' | 'lockedBy' | 'style' | 'text' | 'isDeleted'>
);

export type AddRoomBoardItemMutationVariables = Exact<{
  input: AddRoomBoardItemInput;
}>;


export type AddRoomBoardItemMutation = (
  { __typename?: 'Mutation' }
  & { addRoomBoardItem: (
    { __typename?: 'Item' }
    & ItemBitsFragment
  ) }
);

export type UnlockRoomBoardItemMutationVariables = Exact<{
  input: UnlockRoomBoardItemInput;
}>;


export type UnlockRoomBoardItemMutation = (
  { __typename?: 'Mutation' }
  & { unlockRoomBoardItem: (
    { __typename?: 'Item' }
    & ItemBitsFragment
  ) }
);

export type LockRoomBoardItemMutationVariables = Exact<{
  input: LockRoomBoardItemInput;
}>;


export type LockRoomBoardItemMutation = (
  { __typename?: 'Mutation' }
  & { lockRoomBoardItem: (
    { __typename?: 'Item' }
    & ItemBitsFragment
  ) }
);

export type MoveBoardItemMutationVariables = Exact<{
  input: MoveBoardItemInput;
}>;


export type MoveBoardItemMutation = (
  { __typename?: 'Mutation' }
  & { moveBoardItem: (
    { __typename?: 'Item' }
    & ItemBitsFragment
  ) }
);

export type UpdateBoardItemTextMutationVariables = Exact<{
  input: UpdateBoardItemTextInput;
}>;


export type UpdateBoardItemTextMutation = (
  { __typename?: 'Mutation' }
  & { updateBoardItemText: (
    { __typename?: 'Item' }
    & ItemBitsFragment
  ) }
);

export type UpdateBoardItemStyleMutationVariables = Exact<{
  input: UpdateBoardItemStyleInput;
}>;


export type UpdateBoardItemStyleMutation = (
  { __typename?: 'Mutation' }
  & { updateBoardItemStyle: (
    { __typename?: 'Item' }
    & ItemBitsFragment
  ) }
);

export type DeleteBoardItemMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteBoardItemMutation = (
  { __typename?: 'Mutation' }
  & { deleteBoardItem: (
    { __typename?: 'Item' }
    & Pick<Item, 'id' | 'isDeleted'>
  ) }
);

export type RoomMemberUpdatesSubscriptionVariables = Exact<{
  id: Scalars['ID'];
}>;


export type RoomMemberUpdatesSubscription = (
  { __typename?: 'Subscription' }
  & { roomMemberUpdates: (
    { __typename?: 'Room' }
    & Pick<Room, 'id'>
    & { members: Array<(
      { __typename?: 'Member' }
      & Pick<Member, 'id' | 'name'>
    )> }
  ) }
);

export type ItemUpdatesSubscriptionVariables = Exact<{
  roomId: Scalars['ID'];
}>;


export type ItemUpdatesSubscription = (
  { __typename?: 'Subscription' }
  & { itemUpdates: (
    { __typename?: 'Item' }
    & ItemBitsFragment
  ) }
);

export type RoomQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type RoomQuery = (
  { __typename?: 'Query' }
  & { room?: Maybe<(
    { __typename?: 'Room' }
    & Pick<Room, 'id'>
    & { members: Array<(
      { __typename?: 'Member' }
      & Pick<Member, 'id' | 'name'>
    )>, items: Array<(
      { __typename?: 'Item' }
      & ItemBitsFragment
    )> }
  )> }
);

export type JoinRoomMutationVariables = Exact<{
  input: JoinRoomInput;
}>;


export type JoinRoomMutation = (
  { __typename?: 'Mutation' }
  & { joinRoom: (
    { __typename?: 'Room' }
    & Pick<Room, 'id'>
    & { items: Array<(
      { __typename?: 'Item' }
      & ItemBitsFragment
    )> }
  ) }
);
