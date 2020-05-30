import gql from 'graphql-tag';

const typeDefs = gql`
    input ItemInput {
        id: String!
        posX: Int!
        posY: Int!
        moving: Boolean!
    }

    input UpdateRoomBoardItemsInput {
        id: ID!
        items: [ItemInput]!
    }
    
    type Room {
        id: ID!
        members: [String!]!
        items: [Item!]!
    }
    
    type Item {
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
        updateRoomBoardItems(input: UpdateRoomBoardItemsInput!): Room!
    }
`;

export default typeDefs;
