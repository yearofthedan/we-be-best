import {gql} from 'apollo-boost';

export const ROOM_QUERY = gql`
    query Room($id: String!) {
        room(id: $id)
    }
`;
