import { Member } from '@type-definitions/graphql';

export interface MemberViewModel {
  id: string;
  name: string;
}

export const mapToMemberViewModel = (
  members: Pick<Member, 'id' | 'name'>[]
): MemberViewModel[] => {
  return members.map((m) => {
    return {
      id: m.id,
      name: m.name,
    };
  });
};
