import {RoomResult} from './queryDefinitions';

export default (payload: RoomResult, variables: { id: string }) => {
  return payload.id === variables.id;
};
