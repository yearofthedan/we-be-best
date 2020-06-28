import {Room} from '@type-definitions/graphql';

export default (payload: Room, variables: { id: string }): boolean => {
  return payload.id === variables.id;
};
