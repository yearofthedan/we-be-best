import {PubSub} from 'apollo-server-express';
import {DataSources, MEMBER_CHANGED_TOPIC} from '../apolloServer';
import {AddMemberInput, Member, Room} from '@type-definitions/graphql';
import {MemberModel} from '@/rooms/RoomsDataSource';

const mapToMemberResponse = ({ room, ...rest}: MemberModel): Member => ({
  ...rest,
  room: {
    id: room
  } as Room
});

export const addMember = async (
  _: unknown,
  {input}: { input: AddMemberInput },
  {dataSources, pubSub}: { dataSources: Pick<DataSources, 'Rooms'>; pubSub: PubSub },
): Promise<Member> => {
  const memberModel = await dataSources.Rooms.addMember(input.roomId, input.memberName);
  const result = mapToMemberResponse(memberModel);
  await pubSub.publish(MEMBER_CHANGED_TOPIC, result);

  return result;
};
