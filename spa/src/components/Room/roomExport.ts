import { NoteViewModel } from '@/components/Room/Board/notes';
import { MemberViewModel } from '@/components/Room/members';

export const mapToJsonString = (
  id: string,
  notes: NoteViewModel[],
  members: MemberViewModel[]
): string => {
  return JSON.stringify({
    room: {
      id,
      members,
      notes,
    },
  });
};
