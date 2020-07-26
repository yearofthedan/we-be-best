import { NotesViewModel } from '@/components/Room/Board/notes';
import { MemberViewModel } from '@/components/Room/members';

export const mapToJsonString = (
  id: string,
  notes: NotesViewModel,
  members: MemberViewModel[]
): string => {
  const notesData = Object.values(notes).map(({ lockedBy, ...rest }) => rest);
  return JSON.stringify({
    room: {
      id,
      members,
      notesData,
    },
  });
};
