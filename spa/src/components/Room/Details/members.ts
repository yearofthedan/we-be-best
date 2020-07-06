import { Member } from '@type-definitions/graphql';

export interface MembersViewModel {
  id: string;
  name: string;
}

export const mapToMembersViewModel = (
  members: Member[]
): MembersViewModel[] => {
  return members.map((m) => {
    return {
      id: m.id,
      name: m.name,
    };
  });
};
