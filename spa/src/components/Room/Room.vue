<template>
  <article>
    <template v-if="loading">Loading...</template>
    <template v-else-if="error">An error occurred {{ error }}</template>
    <template v-else-if="room">
      <room-board
        v-bind:zoom-factor="zoomFactor"
        v-bind:my-id="myId"
        v-bind:room-id="roomId"
        v-bind:notes="room.notes"
        v-bind:background="background"
      />
      <room-details
        v-bind:notes="room.notes"
        v-bind:members="room.members"
        v-bind:room-id="roomId"
      />
      <room-controls
        v-on:zoom-in="_onZoomIn"
        v-on:zoom-out="_onZoomOut"
        v-on:add-note="_onAddNote"
        v-on:export="_onExport"
        v-on:share="_onShare"
        v-on:change-background="_onChangeBackground"
        v-bind:background="background"
        v-bind:roomId="roomId"
      />
    </template>
  </article>
</template>

<script lang="ts">
import Vue from 'vue';
import { ApolloError } from 'apollo-client';
import makeNewNote, { NoteViewModel } from '@/components/Room/Board/notes';
import RoomBoard from '@/components/Room/Board/RoomBoard.vue';
import RoomDetails from '@/components/Room/Details/RoomDetails.vue';
import { removeArrayElement, upsertArrayElement } from '@/common/arrays';

import {
  noteUpdates,
  room,
  memberUpdates,
} from '@/graphql/roomQueries.graphql';

import {
  Query,
  Subscription,
  Room,
  QueryRoomArgs,
  SubscriptionMemberUpdatesArgs,
  SubscriptionNoteUpdatesArgs,
  AddRoomBoardNoteInput,
} from '@type-definitions/graphql';
import { addRoomBoardNote } from '@/graphql/boardQueries.graphql';
import RoomControls from '@/components/Room/RoomControls.vue';
import { mapToJsonString } from '@/components/Room/roomExport';
import { MemberViewModel } from '@/components/Room/members';

interface RoomComponentProps {
  roomId: string;
}

interface RoomComponentData {
  loading?: boolean | null;
  error?: ApolloError | Error | null;
  room?: Room | null;
  zoomFactor: number;
  background: string;
}

const resolveUpdate = <T extends { id: string; isDeleted?: boolean | null }>(
  array: T[],
  update: T
) => {
  if (update.isDeleted) {
    return removeArrayElement(array, (e) => e.id === update.id);
  }

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
    };
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
    _onShare: function () {
      const path = `${window.location.host}/?room=${this.roomId}`;
      navigator.clipboard.writeText(path);
    },
    _onExport: function (event: MouseEvent) {
      (event.target as HTMLAnchorElement).href =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(
          mapToJsonString(
            this.roomId,
            this.room?.notes as NoteViewModel[],
            this.room?.members as MemberViewModel[]
          )
        );
    },
    _onAddNote: async function (): Promise<void> {
      const newNote = makeNewNote();
      const mutationPayload: AddRoomBoardNoteInput = {
        posY: newNote.posY,
        posX: newNote.posX,
        roomId: this.roomId,
        noteId: newNote.id,
      };
      try {
        await this.$apollo.mutate({
          mutation: addRoomBoardNote,
          variables: {
            input: mutationPayload,
          },
          optimisticResponse: {
            __typename: 'Mutation',
            addRoomBoardNote: {
              __typename: 'Note',
              ...mutationPayload,
              text: '',
              id: null,
              isDeleted: null,
              lockedBy: null,
              style: null,
            },
          },
        });
      } catch (error) {
        this.$logger.error(error);
        this.$toasted.global.apollo_error(
          `Could not add a new note: ${error.message}`
        );
      }
    },
  },
});
</script>
