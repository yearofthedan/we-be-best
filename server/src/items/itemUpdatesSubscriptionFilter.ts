import {Item} from '@type-definitions/graphql';

export default (payload: Item, variables: { roomId: string }): boolean => {
  if (!payload.room) {
    return false;
  }
  return payload.room.id === variables.roomId;
};
