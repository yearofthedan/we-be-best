import {Room} from './RoomDataSource';

export default (payload: Room, variables: { id: string }) => {
  return payload.id === variables.id;
};
