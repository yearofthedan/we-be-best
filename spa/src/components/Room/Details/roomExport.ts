import {
  ItemViewModel,
  mapToItemsViewModel,
} from '@/components/Room/Board/items';
import {
  mapToMembersViewModel,
  MembersViewModel,
} from '@/components/Room/Details/members';

export const mapToJsonString = (
  id: string,
  items: ItemViewModel[],
  members: MembersViewModel[]
): string => {
  return JSON.stringify({
    room: {
      id,
      members: mapToMembersViewModel(members),
      items: mapToItemsViewModel(items),
    },
  });
};
