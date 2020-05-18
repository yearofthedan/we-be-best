<template>
  <section>
    <ApolloQuery
        :query="this.roomQuery"
        :variables="{ id: '123' }"
    >
      <template v-slot="{ result: { loading, error, data } }">
        <!-- Loading -->
        <div v-if="loading" class="loading apollo">Loading...</div>

        <!-- Error -->
        <div v-else-if="error" class="error apollo">
          An error occurred
          {{ error }}
        </div>

        <!-- Result -->
        <div v-else-if="data" class="result apollo">
          <h1>Room for {{ roomId }}</h1>
          <ul>
            <li v-for="member in data.room.members" :key="member">
              {{ member }}
            </li>
          </ul>
          <shared-board v-bind:room-id="roomId" />
        </div>
      </template>
    </ApolloQuery>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { GET_ROOM_QUERY } from '@/components/roomGraphQLQuery';
import SharedBoard from '@/components/SharedBoard.vue';

export default Vue.extend({
  name: 'joined-room',
  components: {
    'shared-board': SharedBoard,
  },
  props: {
    roomId: {
      type: String,
      required: true,
    },
  },

  data: function() {
    const data: { members: string[] } = {
      members: [],
    };
    return data;
  },
  computed: {
    roomQuery: function() {
      return GET_ROOM_QUERY;
    },
  },
});
</script>
