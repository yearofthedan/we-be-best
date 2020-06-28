
declare module '@/graphql/boardQueries.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const ItemBits: DocumentNode;
export const addRoomBoardItem: DocumentNode;
export const unlockRoomBoardItem: DocumentNode;
export const lockRoomBoardItem: DocumentNode;
export const moveBoardItem: DocumentNode;
export const updateBoardItemText: DocumentNode;
export const updateBoardItemStyle: DocumentNode;
export const deleteBoardItem: DocumentNode;

  export default defaultDocument;
}
    

declare module '@/graphql/roomQueries.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  export const roomMemberUpdates: DocumentNode;
export const itemUpdates: DocumentNode;
export const room: DocumentNode;
export const joinRoom: DocumentNode;

  export default defaultDocument;
}
    