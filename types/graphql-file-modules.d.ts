
declare module '@/graphql/boardQueries.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const NoteBits: DocumentNode;
export const addRoomBoardNote: DocumentNode;
export const unlockRoomBoardNote: DocumentNode;
export const lockRoomBoardNote: DocumentNode;
export const moveBoardNote: DocumentNode;
export const updateBoardNoteText: DocumentNode;
export const updateBoardNoteStyle: DocumentNode;
export const deleteBoardNote: DocumentNode;

  export default defaultDocument;
}
    

declare module '@/graphql/roomQueries.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const MemberBits: DocumentNode;
export const memberUpdates: DocumentNode;
export const noteUpdates: DocumentNode;
export const room: DocumentNode;
export const addMember: DocumentNode;

  export default defaultDocument;
}
    