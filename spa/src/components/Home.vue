<template>
  <transition name="fade">
    <lobby
      v-if="!memberName && !roomId"
      v-on:joined="_onJoined"
      v-bind:existingRoomId="existingRoomId"
    />
    <room v-else v-bind:room-id="roomId" v-bind:my-id="memberName" />
  </transition>
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to
  /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
