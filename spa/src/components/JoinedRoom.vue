<script lang="ts">
import Vue from "vue";
import { RoomQueryResponseData } from "@/components/RoomTypes";
import {GET_ROOM_QUERY} from '@/components/roomGraphQLQuery';

export default Vue.extend({
  name: "joined-room",
  props: {
    roomId: {
      type: String,
      required: true
    }
  },
  data: function() {
    const data: { members: string[] } = {
      members: []
    };
    return data;
  },
  mounted() {
    this.$apollo
      .query({
        query: GET_ROOM_QUERY,
        variables: {
          id: "123"
        }
      })
      .then((res: RoomQueryResponseData) => {
        this.members = res.data.room.members;
      });
  }
});
</script>

<template>
  <section>
    <h1>Room for {{ roomId }}</h1>
    <ul>
      <li v-for="member in members" :key="member">{{ member }}</li>
    </ul>
  </section>
</template>
