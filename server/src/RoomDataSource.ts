import {DataSource} from 'apollo-datasource';

class RoomDataSource extends DataSource {

  getRoom() {
    return {
      id: '',
      members: ['stub']
    };
  }
}

export default RoomDataSource;
