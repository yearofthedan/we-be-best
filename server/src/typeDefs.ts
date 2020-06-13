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

    input LockRoomBoardItemInput {
        id: ID!
        lockedBy: ID!
    }
    
    input UnlockRoomBoardItemInput {
        roomId: ID!
        itemId: ID!
        meId: ID!
    }
    
    input AddRoomBoardItemInput {
        roomId: ID!
        itemId: String!
        posX: Int!
        posY: Int!
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
        roomMemberUpdates(id: ID!): Room!
    }
    
    type Mutation {
        joinRoom(input: JoinRoomInput!): Room!
        updateRoomBoardItems(input: UpdateRoomBoardItemsInput!): Room!
        lockRoomBoardItem(input: LockRoomBoardItemInput!): Room!
        unlockRoomBoardItem(input: UnlockRoomBoardItemInput!): Room!
        addRoomBoardItem(input: AddRoomBoardItemInput!): Room!
    }
`;

export default typeDefs;
