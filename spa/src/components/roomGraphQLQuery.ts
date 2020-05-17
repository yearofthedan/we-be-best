import gql from 'graphql-tag';

export const GET_ROOM_QUERY = gql`
  query room($id: ID!) {
    room(id: $id) {
      id
      members
    }
  }
`;
