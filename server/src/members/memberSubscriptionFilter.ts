import {Member} from '@type-definitions/graphql';

export default (payload: Member, variables: { roomId: string }): boolean => {
  return payload.room.id === variables.roomId;
};
