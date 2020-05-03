import {gql} from 'apollo-server';

const typeDefs = gql`
    type Room {
        id: ID!
        members: [String]
    }

    type Query {
        room(id: ID!): Room
    }
`;

export default typeDefs;
