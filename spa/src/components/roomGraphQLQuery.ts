import {gql} from 'apollo-boost';

export const GET_ROOM_QUERY = gql`
    query Room($id: ID!) {
        room(id: $id) {
            id
            members
        }
    }
`;
