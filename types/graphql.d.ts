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

export type NoteInput = {
  id: Scalars['String'];
  posX: Scalars['Int'];
  posY: Scalars['Int'];
  lockedBy?: Maybe<Scalars['String']>;
};

export type MoveBoardNoteInput = {
  id: Scalars['String'];
  posX: Scalars['Int'];
  posY: Scalars['Int'];
};

export type LockRoomBoardNoteInput = {
  id: Scalars['ID'];
  lockedBy: Scalars['ID'];
};

export type UnlockRoomBoardNoteInput = {
  id: Scalars['ID'];
};

export type UpdateBoardNoteTextInput = {
  id: Scalars['ID'];
  text: Scalars['String'];
};

export type UpdateBoardNoteStyleInput = {
  id: Scalars['ID'];
  style: Scalars['Int'];
};

export type AddRoomBoardNoteInput = {
  roomId: Scalars['ID'];
  noteId: Scalars['String'];
  posX: Scalars['Int'];
  posY: Scalars['Int'];
};

export type AddMemberInput = {
  roomId: Scalars['ID'];
  memberName: Scalars['String'];
};

export type Room = {
  __typename?: 'Room';
  id: Scalars['ID'];
  members: Array<Member>;
  notes: Array<Note>;
};

export type Note = {
  __typename?: 'Note';
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
  room: Room;
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
  memberUpdates: Member;
  noteUpdates: Note;
};


export type SubscriptionMemberUpdatesArgs = {
  roomId: Scalars['ID'];
};


export type SubscriptionNoteUpdatesArgs = {
  roomId: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addMember: Member;
  moveBoardNote: Note;
  lockRoomBoardNote: Note;
  unlockRoomBoardNote: Note;
  addRoomBoardNote: Note;
  updateBoardNoteText: Note;
  updateBoardNoteStyle: Note;
  deleteBoardNote: Note;
};


export type MutationAddMemberArgs = {
  input: AddMemberInput;
};


export type MutationMoveBoardNoteArgs = {
  input: MoveBoardNoteInput;
};


export type MutationLockRoomBoardNoteArgs = {
  input: LockRoomBoardNoteInput;
};


export type MutationUnlockRoomBoardNoteArgs = {
  input: UnlockRoomBoardNoteInput;
};


export type MutationAddRoomBoardNoteArgs = {
  input: AddRoomBoardNoteInput;
};


export type MutationUpdateBoardNoteTextArgs = {
  input: UpdateBoardNoteTextInput;
};


export type MutationUpdateBoardNoteStyleArgs = {
  input: UpdateBoardNoteStyleInput;
};


export type MutationDeleteBoardNoteArgs = {
  id: Scalars['ID'];
};

export type NoteBitsFragment = (
  { __typename: 'Note' }
  & Pick<Note, 'id' | 'posX' | 'posY' | 'lockedBy' | 'style' | 'text' | 'isDeleted'>
);

export type AddRoomBoardNoteMutationVariables = Exact<{
  input: AddRoomBoardNoteInput;
}>;


export type AddRoomBoardNoteMutation = (
  { __typename?: 'Mutation' }
  & { addRoomBoardNote: (
    { __typename?: 'Note' }
    & NoteBitsFragment
  ) }
);

export type UnlockRoomBoardNoteMutationVariables = Exact<{
  input: UnlockRoomBoardNoteInput;
}>;


export type UnlockRoomBoardNoteMutation = (
  { __typename?: 'Mutation' }
  & { unlockRoomBoardNote: (
    { __typename?: 'Note' }
    & NoteBitsFragment
  ) }
);

export type LockRoomBoardNoteMutationVariables = Exact<{
  input: LockRoomBoardNoteInput;
}>;


export type LockRoomBoardNoteMutation = (
  { __typename?: 'Mutation' }
  & { lockRoomBoardNote: (
    { __typename?: 'Note' }
    & NoteBitsFragment
  ) }
);

export type MoveBoardNoteMutationVariables = Exact<{
  input: MoveBoardNoteInput;
}>;


export type MoveBoardNoteMutation = (
  { __typename?: 'Mutation' }
  & { moveBoardNote: (
    { __typename?: 'Note' }
    & NoteBitsFragment
  ) }
);

export type UpdateBoardNoteTextMutationVariables = Exact<{
  input: UpdateBoardNoteTextInput;
}>;


export type UpdateBoardNoteTextMutation = (
  { __typename?: 'Mutation' }
  & { updateBoardNoteText: (
    { __typename?: 'Note' }
    & NoteBitsFragment
  ) }
);

export type UpdateBoardNoteStyleMutationVariables = Exact<{
  input: UpdateBoardNoteStyleInput;
}>;


export type UpdateBoardNoteStyleMutation = (
  { __typename?: 'Mutation' }
  & { updateBoardNoteStyle: (
    { __typename?: 'Note' }
    & NoteBitsFragment
  ) }
);

export type DeleteBoardNoteMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteBoardNoteMutation = (
  { __typename?: 'Mutation' }
  & { deleteBoardNote: (
    { __typename?: 'Note' }
    & Pick<Note, 'id' | 'isDeleted'>
  ) }
);

export type MemberBitsFragment = (
  { __typename: 'Member' }
  & Pick<Member, 'id' | 'name'>
  & { room: (
    { __typename?: 'Room' }
    & Pick<Room, 'id'>
  ) }
);

export type MemberUpdatesSubscriptionVariables = Exact<{
  roomId: Scalars['ID'];
}>;


export type MemberUpdatesSubscription = (
  { __typename?: 'Subscription' }
  & { memberUpdates: (
    { __typename?: 'Member' }
    & MemberBitsFragment
  ) }
);

export type NoteUpdatesSubscriptionVariables = Exact<{
  roomId: Scalars['ID'];
}>;


export type NoteUpdatesSubscription = (
  { __typename?: 'Subscription' }
  & { noteUpdates: (
    { __typename?: 'Note' }
    & NoteBitsFragment
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
    )>, notes: Array<(
      { __typename?: 'Note' }
      & NoteBitsFragment
    )> }
  )> }
);

export type AddMemberMutationVariables = Exact<{
  input: AddMemberInput;
}>;


export type AddMemberMutation = (
  { __typename?: 'Mutation' }
  & { addMember: (
    { __typename?: 'Member' }
    & MemberBitsFragment
  ) }
);
