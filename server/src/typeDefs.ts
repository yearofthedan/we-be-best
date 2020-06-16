import gql from 'graphql-tag';

const typeDefs = gql`
    input ItemInput {
        id: String!
        posX: Int!
        posY: Int!
        lockedBy: String
    }

    input MoveBoardItemInput {
        id: String!
        posX: Int!
        posY: Int!
    }

    input LockRoomBoardItemInput {
        id: ID!
        lockedBy: ID!
    }
    
    input UnlockRoomBoardItemInput {
        id: ID!
    }

    input UpdateBoardItemTextInput {
        id: ID!
        text: String!
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
        room: Room
        text: String!
    }

    type Query {
        room(id: ID!): Room
    }

    type Subscription {
        roomMemberUpdates(id: ID!): Room!
        itemUpdates(roomId: ID!): Item! 
    }
    
    type Mutation {
        joinRoom(input: JoinRoomInput!): Room!
        moveBoardItem(input: MoveBoardItemInput!): Item!
        lockRoomBoardItem(input: LockRoomBoardItemInput!): Item!
        unlockRoomBoardItem(input: UnlockRoomBoardItemInput!): Item!
        addRoomBoardItem(input: AddRoomBoardItemInput!): Item!
        updateBoardItemText(input: UpdateBoardItemTextInput!): Item!
    }
`;

export default typeDefs;
