<template>
  <article>
    <template v-if="loading">Loading...</template>
    <template v-else-if="error">An error occurred {{ error }}</template>
    <template v-else-if="room">
      <room-board
        v-bind:zoom-factor="zoomFactor"
        v-bind:my-id="myId"
        v-bind:room-id="roomId"
        v-bind:notes="this.notesData"
        v-bind:autoEditNoteId="autoEditNoteId"
        v-bind:background="background"
      />
      <room-details v-bind:members="members" v-bind:room-id="roomId" />
      <room-controls
        v-on:zoom-in="_onZoomIn"
        v-on:zoom-out="_onZoomOut"
        v-on:add-note="_onAddNote"
        v-on:change-background="_onChangeBackground"
        v-bind:background="background"
        v-bind:roomId="roomId"
        v-bind:notes="notesData"
        v-bind:members="members"
      />
    </template>
  </article>
</template>

<script lang="ts">
import Vue from 'vue';
import { ApolloError } from 'apollo-client';
import {
  mapToNotesViewModel,
  NotesViewModel,
  NoteViewModel,
} from '@/components/Room/Board/notes';
import RoomBoard from '@/components/Room/Board/RoomBoard.vue';
import RoomDetails from '@/components/Room/Details/RoomDetails.vue';
import { upsertArrayElement } from '@/common/arrays';

import {
  memberUpdates,
  noteUpdates,
  room,
} from '@/graphql/roomQueries.graphql';

import {
  Query,
  QueryRoomArgs,
  Room,
  Subscription,
  SubscriptionMemberUpdatesArgs,
  SubscriptionNoteUpdatesArgs,
} from '@type-definitions/graphql';
import RoomControls from '@/components/Room/RoomControls.vue';
import {
  mapToMembersViewModel,
  MemberViewModel,
} from '@/components/Room/members';

interface RoomComponentProps {
  roomId: string;
}

interface RoomComponentData {
  loading?: boolean | null;
  error?: ApolloError | Error | null;
  room?: Room | null;
  zoomFactor: number;
  background: string;
  notesData: NotesViewModel;
  autoEditNoteId: string | null;
}

const resolveUpdate = <T extends { id: string }>(array: T[], update: T) => {
  return upsertArrayElement(array, update, (e) => e.id === update.id);
};

export default Vue.extend({
  name: 'room' as string,
  components: {
    'room-board': RoomBoard,
    'room-details': RoomDetails,
    'room-controls': RoomControls,
  },
  props: {
    myId: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
  },
  data: function (): RoomComponentData {
    return {
      loading: null,
      error: null,
      room: null,
      zoomFactor: 1,
      background: 'QUADRANTS',
      notesData: {},
      autoEditNoteId: null,
    };
  },
  watch: {
    room: {
      handler: function (newVal) {
        this.notesData = mapToNotesViewModel(newVal?.notes ?? [], {
          ...this.notesData,
        });
      },
    },
  },
  computed: {
    members(): MemberViewModel[] {
      return mapToMembersViewModel(this.room?.members ?? []);
    },
  },
  apollo: {
    room: {
      query: room,
      variables(): QueryRoomArgs {
        return { id: this.roomId };
      },
      subscribeToMore: [
        {
          document: memberUpdates,
          variables: function (): SubscriptionMemberUpdatesArgs {
            return { roomId: ((this as unknown) as RoomComponentProps).roomId };
          },
          onError(error: ApolloError) {
            ((this as unknown) as RoomComponentData).error = error;
          },
          updateQuery(
            previousResult: Pick<Query, 'room'>,
            {
              subscriptionData,
            }: {
              subscriptionData: {
                data: Pick<Subscription, 'memberUpdates'>;
              };
            }
          ) {
            const currentRoom = ((this as unknown) as RoomComponentData).room;
            if (!currentRoom) {
              return;
            }

            return {
              room: {
                ...currentRoom,
                members: resolveUpdate(
                  currentRoom.members,
                  subscriptionData.data.memberUpdates
                ),
              },
            };
          },
        },
        {
          document: noteUpdates,
          variables: function (): SubscriptionNoteUpdatesArgs {
            return { roomId: ((this as unknown) as RoomComponentProps).roomId };
          },
          onError(error: ApolloError) {
            ((this as unknown) as RoomComponentData).error = error;
          },
          updateQuery(
            previousResult: Pick<Query, 'room'>,
            {
              subscriptionData,
            }: { subscriptionData: { data: Pick<Subscription, 'noteUpdates'> } }
          ) {
            const currentRoom = ((this as unknown) as RoomComponentData).room;
            if (!currentRoom?.notes) {
              return;
            }

            if (currentRoom.notes) {
              return {
                room: {
                  ...currentRoom,
                  notes: resolveUpdate(
                    currentRoom.notes,
                    subscriptionData.data.noteUpdates
                  ),
                },
              };
            }
          },
        },
      ],
      error(error: ApolloError) {
        this.error = error;
      },
      watchLoading(isLoading: boolean) {
        this.loading = isLoading;
      },
    },
  },
  methods: {
    _onChangeBackground: function (type: string) {
      this.background = type;
    },
    _onZoomOut: function () {
      this.zoomFactor -= 0.2;
    },
    _onZoomIn: function () {
      this.zoomFactor += 0.2;
    },
    _onAddNote: async function (note: NoteViewModel): Promise<void> {
      this.autoEditNoteId = note.id;
    },
  },
});
</script>
