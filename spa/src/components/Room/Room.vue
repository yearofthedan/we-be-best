<template>
  <section>
    <apollo-query :query="this.roomQuery" :variables="{ id: this.roomId }">
      <apollo-subscribe-to-more
        :document="this.roomSubscription"
        :variables="{ id: this.roomId }"
        :updateQuery="onRoomUpdate"
      />
      <template v-slot="{ result: { loading, error, data } }">
        <div v-if="loading" class="loading apollo">Loading...</div>
        <div v-else-if="error" class="error apollo">
          An error occurred
          {{ error }}
        </div>
        <div v-else-if="data" class="result apollo">
          <h1>Room for {{ roomId }}</h1>
          <ul>
            <li v-for="member in data.room.members" :key="member">
              {{ member }}
            </li>
          </ul>
          <room-board my-id="PERSON123" v-bind:room-id="roomId" v-bind:items="data.room.items" />
        </div>
      </template>
    </apollo-query>
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

export default Vue.extend({
  name: 'room',
  components: {
    'room-board': RoomBoard,
  },
  props: {
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
