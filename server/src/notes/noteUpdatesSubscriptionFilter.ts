import {Note} from '@type-definitions/graphql';

export default (payload: Note, variables: { roomId: string }): boolean => {
  if (!payload.room) {
    return false;
  }
  return payload.room.id === variables.roomId;
};
