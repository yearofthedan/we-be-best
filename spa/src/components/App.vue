<template>
  <main id="app">
    <article>
      <lobby v-if="!roomId" v-on:joined="_onJoined" />
      <room v-else v-bind:room-id="roomId" v-bind:my-id="memberName" />
    </article>
  </main>
</template>

<script lang="ts">
import Vue from 'vue';
import Lobby from '@/components/Lobby/Lobby.vue';
import Room from '@/components/Room/Room.vue';

export default Vue.extend({
  name: 'app',
  components: {
    lobby: Lobby,
    room: Room,
  },
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

<style>
body,
main {
  min-height: 100vh;
  overflow: hidden;
}

body,
h1,
h2 {
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;

  --mint: hsla(107, 4%, 97%, 1);
  --light-blue: hsla(215, 100%, 96%, 1);
  --black: hsla(218, 73%, 6%, 1);
  --blue: hsla(215, 57%, 74%, 1);
  --red: hsl(343, 79%, 55%);
  --grey: hsla(180, 2%, 49%, 1);

  --colour-primary: var(--light-blue);
  --colour-primary-emphasis: var(--blue);
  --colour-secondary: var(--grey);
  --colour-shadow: var(--black);
  --colour-background: var(--mint);
  --colour-warning: var(--red);

  --unit-base-px: 4px;
  --unit-base-rem: calc(1rem / 4);

  --font-size-aside: calc(3 * var(--unit-base-rem));
  --font-size-interactive: calc(4 * var(--unit-base-rem));
  --font-size-label: calc(4 * var(--unit-base-rem));
  --font-size-text: calc(6 * var(--unit-base-rem));
  --font-size-icon-button: calc(8 * var(--unit-base-rem));

  background-color: var(--colour-background);
}
article {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-row-gap: calc(3 * var(--unit-base-rem));
}
</style>
