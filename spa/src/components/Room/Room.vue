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
      <room-details v-bind:members="room.members" />
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  GET_ROOM_QUERY,
  GetRoomQueryData,
  ROOM_ITEM_UPDATES_SUBSCRIPTION,
  ROOM_MEMBER_UPDATES_SUBSCRIPTION,
  RoomData,
  RoomItemUpdatesSubscriptionData,
  RoomMemberUpdatesSubscriptionData,
} from '@/components/Room/roomGraphQLQuery';
import { ApolloError } from 'apollo-client';
import { Item } from '@/components/Room/Board/itemBuilder';
import RoomBoard from '@/components/Room/Board/RoomBoard.vue';
import RoomDetails from '@/components/Room/Details/RoomDetails.vue';
import { removeArrayElement, upsertArrayElement } from '@/common/arrays';

interface RoomComponentProps {
  roomId: string;
}

interface RoomComponentData {
  loading?: boolean | null;
  error?: ApolloError | Error | null;
  room?: RoomData | null;
}

const resolveUpdate = (items: Item[], update: Item) => {
  if (update.isDeleted) {
    return removeArrayElement(items, (e) => e.id === update.id);
  }

  return upsertArrayElement(items, update, (e) => e.id === update.id);
};

export default Vue.extend({
  name: 'room' as string,
  components: {
    'room-board': RoomBoard,
    'room-details': RoomDetails,
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
                  items: resolveUpdate(
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
}
</style>
