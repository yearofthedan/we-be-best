<template>
  <article>
    <lobby
      v-if="!memberName && !roomName"
      v-on:joined="_onJoined"
      v-bind:roomId="roomId"
    />
    <room v-else v-bind:room-id="roomName" v-bind:my-id="memberName" />
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
    roomId: {
      type: String,
      required: false,
    },
  },
  data(): { roomName: string | null; memberName: string | null } {
    return {
      roomName: null,
      memberName: null,
    };
  },
  methods: {
    _onJoined: function (params: { roomName: string; memberName: string }) {
      this.roomName = params.roomName;
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
