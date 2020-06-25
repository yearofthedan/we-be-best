export interface ItemResult {
  id: string;
  posY: number;
  posX: number;
  lockedBy?: string;
  room: string;
  text: string;
  isDeleted?: boolean;
}
