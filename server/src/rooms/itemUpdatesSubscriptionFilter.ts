import {ItemResult} from './queryDefinitions';

export default (payload: { item: ItemResult; roomId: string }, variables: { roomId: string }) => {
  return payload.roomId === variables.roomId;
};
