import gql from 'graphql-tag';

const typeDefs = gql`
    input NoteInput {
        id: String!
        posX: Int!
        posY: Int!
        moving: Boolean!
    }

    input UpdateRoomNotesInput {
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
        roomUpdates(id: ID!): Room!
    }
    
    type Mutation {
        updateRoomNotes(input: UpdateRoomNotesInput!): Room!
    }
`;

export default typeDefs;
