import { NotesViewModel } from '@/components/Room/Board/notes';
import { MemberViewModel } from '@/components/Room/members';

export const mapToJsonString = (
  id: string,
  notes: NotesViewModel,
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
