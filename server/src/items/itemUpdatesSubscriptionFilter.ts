import {ItemResult} from './queryDefinitions';

export default (payload: ItemResult, variables: { roomId: string }): boolean => {
  return payload.room === variables.roomId;
};
