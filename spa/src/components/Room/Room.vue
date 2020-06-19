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
  GetRoomQueryData,
  ROOM_MEMBER_UPDATES_SUBSCRIPTION,
  RoomData,
  RoomMemberUpdatesSubscriptionData,
  ROOM_ITEM_UPDATES_SUBSCRIPTION,
  RoomItemUpdatesSubscriptionData,
} from '@/components/Room/roomGraphQLQuery';
import RoomMembers from '@/components/Room/RoomMembers.vue';
import { ApolloError } from 'apollo-client';
import { Item } from '@/components/Room/Board/itemBuilder';
import RoomBoard from '@/components/Room/Board/RoomBoard.vue';

interface RoomComponentProps {
  roomId: string;
}

interface RoomComponentData {
  loading?: boolean | null;
  error?: ApolloError | Error | null;
  room?: RoomData | null;
}

const upsertItem = (array: Item[], item: Item) => {
  const index = array.findIndex((e) => e.id === item.id);

  if (item.isDeleted) {
    return [...array.slice(0, index), ...array.slice(index + 1)];
  }

  if (index == -1) {
    return [...array, item];
  }

  return [...array.slice(0, index), item, ...array.slice(index + 1)];
};

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
  data: function (): RoomComponentData {
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
          document: ROOM_MEMBER_UPDATES_SUBSCRIPTION,
          variables: function (): { id: string } {
            return { id: ((this as unknown) as RoomComponentProps).roomId };
          },
          onError(error: ApolloError) {
            ((this as unknown) as RoomComponentData).error = error;
          },
          updateQuery(
            previousResult: GetRoomQueryData,
            {
              subscriptionData,
            }: { subscriptionData: { data: RoomMemberUpdatesSubscriptionData } }
          ) {
            return {
              room: {
                ...((this as unknown) as RoomComponentData).room,
                members: subscriptionData.data.roomMemberUpdates.members,
              },
            };
          },
        },
        {
          document: ROOM_ITEM_UPDATES_SUBSCRIPTION,
          variables: function (): { roomId: string } {
            return { roomId: ((this as unknown) as RoomComponentProps).roomId };
          },
          onError(error: ApolloError) {
            ((this as unknown) as RoomComponentData).error = error;
          },
          updateQuery(
            previousResult: GetRoomQueryData,
            {
              subscriptionData,
            }: { subscriptionData: { data: RoomItemUpdatesSubscriptionData } }
          ) {
            const currentRoom = ((this as unknown) as RoomComponentData).room;
            if (!currentRoom?.items) {
              return;
            }

            if (currentRoom.items)
              return {
                room: {
                  ...currentRoom,
                  items: upsertItem(
                    currentRoom.items,
                    subscriptionData.data.itemUpdates
                  ),
                },
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
