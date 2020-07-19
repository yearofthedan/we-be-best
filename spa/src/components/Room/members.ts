import { Member } from '@type-definitions/graphql';

export interface MemberViewModel {
  id: string;
  name: string;
}

const mapToMemberViewModel = (member: Member): MemberViewModel => {
  return {
    id: member.id,
    name: member.name,
  };
};

export const mapToMembersViewModel = (members: Member[]): MemberViewModel[] => {
  return members.map(mapToMemberViewModel);
};
