import gql from 'graphql-tag';

const typeDefs = gql`
    type Room {
        id: ID!
        members: [String]
    }

    type Query {
        room(id: ID!): Room
    }

    type Subscription {
        roomChanged: Room!
    }
    
    type Mutation {
        roomChanged: Room!
    }
    
`;

export default typeDefs;
