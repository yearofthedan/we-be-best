import gql from 'graphql-tag';

const typeDefs = gql`
    input ItemInput {
        id: String!
        posX: Int!
        posY: Int!
        lockedBy: String
    }

    input UpdateRoomBoardItemsInput {
        id: ID!
        items: [ItemInput]!
    }

    input JoinRoomInput {
        roomName: ID!
        memberName: String!
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
        lockedBy: String
    }

    type Query {
        room(id: ID!): Room
    }

    type Subscription {
        roomUpdates(id: ID!): Room!
    }
    
    type Mutation {
        joinRoom(input: JoinRoomInput!): Room!
        updateRoomBoardItems(input: UpdateRoomBoardItemsInput!): Room!
    }
`;

export default typeDefs;
