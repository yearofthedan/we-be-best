import gql from 'graphql-tag';

const typeDefs = gql`
    input NoteInput {
        id: String!
        posX: Int!
        posY: Int!
        moving: Boolean!
    }

    input RoomChangedInput {
        id: ID!
        notes: [NoteInput]!
    }
    
    type Room {
        id: ID!
        members: [String!]!
        notes: [Note!]!
    }
    
    type Note {
        id: String!
        posX: Int!
        posY: Int!
        moving: Boolean!
    }

    type Query {
        room(id: ID!): Room
    }

    type Subscription {
        roomChanged: Room!
    }
    
    type Mutation {
        roomChanged(input: RoomChangedInput!): Room!
    }
`;

export default typeDefs;
