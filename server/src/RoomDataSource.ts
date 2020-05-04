import {DataSource} from 'apollo-datasource';

class RoomDataSource extends DataSource {

  getRoom(id: string) {
    return {
      id: id,
      members: ['stub']
    };
  }
}

export default RoomDataSource;
