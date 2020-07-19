import {
  NoteViewModel,
  mapToNotesViewModel,
} from '@/components/Room/Board/notes';
import {
  mapToMemberViewModel,
  MemberViewModel,
} from '@/components/Room/members';

export const mapToJsonString = (
  id: string,
  notes: NoteViewModel[],
  members: MemberViewModel[]
): string => {
  return JSON.stringify({
    room: {
      id,
      members: mapToMemberViewModel(members),
      notes: mapToNotesViewModel(notes),
    },
  });
};
