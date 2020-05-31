export enum ActionType {
  MOVING = 'MOVING',
}

export interface Item {
  id: string;
  posX: number;
  posY: number;
  lockedBy?: string;
}

export interface Interaction {
  itemId: string;
  action: ActionType.MOVING;
}

export interface InteractionStartEventPayload {
  itemId: string;
  interactionId: string;
  action: ActionType;
}

export interface InteractionEndEventPayload {
  interactionId: string;
}

export interface InteractionMovedEventPayload {
  interactionId: string;
  movementX: number;
  movementY: number;
}
