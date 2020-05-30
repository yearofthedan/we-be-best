<script lang="ts">
import Vue from 'vue';
import Room from '@/components/Room/Room.vue';
import JoinRoomForm from '@/components/Lobby/JoinRoomForm.vue';

export default Vue.extend({
  components: {
    'join-room-form': JoinRoomForm,
    room: Room,
  },
  name: 'Lobby',
  data(): { roomId: string | null } {
    return { roomId: null };
  },
  methods: {
    _onJoined: function(room: { id: string }) {
      this.roomId = room.id;
    },
  },
});
</script>

<template>
  <article>
    <header>
      <h1>We be best</h1>
    </header>
    <room v-if="roomId" v-bind:room-id="roomId" />
    <join-room-form v-else v-on:joined="_onJoined" />
  </article>
</template>

<style scoped>
h3 {
  margin: 40px 0 0;
}
</style>
