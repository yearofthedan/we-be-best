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
  data(): { roomId: string | null; memberName: string | null } {
    return {
      roomId: null,
      memberName: null,
    };
  },
  methods: {
    _onJoined: function (params: { roomName: string; memberName: string }) {
      this.roomId = params.roomName;
      this.memberName = params.memberName;
    },
  },
});
</script>

<template>
  <article>
    <header>
      <h1>We be best</h1>
      <aside>{{ memberName }}</aside>
    </header>
    <room v-if="roomId" v-bind:room-id="roomId" v-bind:my-id="memberName" />
    <join-room-form v-else v-on:joined="_onJoined" />
  </article>
</template>

<style scoped>
article {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-row-gap: calc(3 * var(--unit-base-rem));
}

header {
  background-color: var(--colour-primary);
  display: grid;
  grid-template-areas: 'title-block . name-block';
  grid-template-columns: max-content 1fr max-content;
  align-items: center;
}

h1 {
  padding: var(--unit-base-rem);
  grid-area: title-block;
}

aside {
  grid-area: name-block;
  padding: 0 calc(4 * var(--unit-base-rem));
  background-color: var(--colour-primary-emphasis);
  border-left: calc(2 * var(--unit-base-rem)) var(--colour-background) solid;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
