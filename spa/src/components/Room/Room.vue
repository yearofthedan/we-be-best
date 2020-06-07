<template>
  <section>
    <template v-if="loading">Loading...</template>
    <template v-else-if="error">An error occurred {{ error }}</template>
    <template v-else-if="room">
      <room-board
        v-bind:my-id="myId"
        v-bind:room-id="roomId"
        v-bind:items="room.items"
      />
      <div>
        <span>{{ roomId }}</span>
        <room-members v-bind:members="room.members" />
      </div>
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  GET_ROOM_QUERY,
  ROOM_UPDATES_SUBSCRIPTION,
  RoomData,
} from '@/components/Room/roomGraphQLQuery';
import RoomBoard from '@/components/Room/RoomBoard.vue';
import RoomMembers from '@/components/Room/RoomMembers.vue';
import { ApolloError } from 'apollo-client';

interface RoomComponentProps {
  roomId: string;
}

interface RoomComponentData {
  loading?: boolean | null;
  error?: ApolloError | Error | null;
  room?: RoomData | null;
}

export default Vue.extend({
  name: 'room' as string,
  components: {
    'room-board': RoomBoard,
    'room-members': RoomMembers,
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
  data: function(): RoomComponentData {
    return {
      loading: null,
      error: null,
      room: null,
    };
  },
  apollo: {
    room: {
      query: GET_ROOM_QUERY,
      variables(): { id: string } {
        return { id: this.roomId };
      },
      subscribeToMore: [
        {
          document: ROOM_UPDATES_SUBSCRIPTION,
          variables: function(): { id: string } {
            return { id: ((this as unknown) as RoomComponentProps).roomId };
          },
          onError(error: ApolloError) {
            ((this as unknown) as RoomComponentData).error = error;
          },
          updateQuery(
            previousResult: RoomData,
            {
              subscriptionData,
            }: { subscriptionData: { data: { roomUpdates: RoomData } } }
          ) {
            return {
              room: subscriptionData.data.roomUpdates,
            };
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
});
</script>

<style scoped>
section {
  background-color: var(--colour-background);
  display: grid;
  grid-template-columns: 1fr max-content;
}

section > div {
  background-color: var(--colour-primary);
  display: flex;
  flex-direction: column;
}
</style>
