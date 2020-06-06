<template>
  <apollo-query
    :query="this.roomQuery"
    :variables="{ id: this.roomId }"
    tag="section"
  >
    <apollo-subscribe-to-more
      :document="this.roomSubscription"
      :variables="{ id: this.roomId }"
      :updateQuery="onRoomUpdate"
    />
    <template v-slot="{ result: { loading, error, data } }">
      <template v-if="loading" class="loading apollo">Loading...</template>
      <template v-else-if="error" class="error apollo">
        An error occurred
        {{ error }}
      </template>
      <template v-else-if="data" class="result apollo">
        <room-board
          v-bind:my-id="myId"
          v-bind:room-id="roomId"
          v-bind:items="data.room.items"
        />
        <div>
          <span>{{ roomId }}</span>
          <room-members v-bind:members="data.room.members" />
        </div>
      </template>
    </template>
  </apollo-query>
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

export default Vue.extend({
  name: 'room',
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
  methods: {
    onRoomUpdate(
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
  computed: {
    roomQuery: function() {
      return GET_ROOM_QUERY;
    },
    roomSubscription: function() {
      return ROOM_UPDATES_SUBSCRIPTION;
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
