import {
  ItemViewModel,
  mapToItemsViewModel,
} from '@/components/Room/Board/items';
import {
  mapToMemberViewModel,
  MemberViewModel,
} from '@/components/Room/Details/members';

export const mapToJsonString = (
  id: string,
  items: ItemViewModel[],
  members: MemberViewModel[]
): string => {
  return JSON.stringify({
    room: {
      id,
      members: mapToMemberViewModel(members),
      items: mapToItemsViewModel(items),
    },
  });
};
