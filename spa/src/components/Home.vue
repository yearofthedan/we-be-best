<template>
  <article>
    <lobby
      v-if="!memberName && !roomId"
      v-on:joined="_onJoined"
      v-bind:existingRoomId="existingRoomId"
    />
    <room v-else v-bind:room-id="roomId" v-bind:my-id="memberName" />
  </article>
</template>

<script lang="ts">
import Vue from 'vue';
import Lobby from '@/components/Lobby/Lobby.vue';
import Room from '@/components/Room/Room.vue';

export default Vue.extend({
  name: 'home',
  components: {
    lobby: Lobby,
    room: Room,
  },
  props: {
    existingRoomId: {
      type: String,
      required: false,
    },
  },
  data(): { roomId: string | null; memberName: string | null } {
    return {
      roomId: null,
      memberName: null,
    };
  },
  methods: {
    _onJoined: function (params: { roomId: string; memberName: string }) {
      this.roomId = params.roomId;
      this.memberName = params.memberName;
    },
  },
});
</script>

<style>
article {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-row-gap: calc(3 * var(--unit-base-rem));
}
</style>
