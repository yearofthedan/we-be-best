<template>
  <main id="app">
    <lobby room-id="123" />
  </main>
</template>

<script lang="ts">
import Vue from 'vue';
import Lobby from '@/components/Lobby/Lobby.vue';

export default Vue.extend({
  name: 'app',
  components: {
    lobby: Lobby,
  },
});
</script>

<style>
body,
main {
  min-height: 100vh;
}

body,
h1,
h2 {
  margin: 0;
}

section {
  background-color: var(--colour-background);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;

  --mint: hsla(107, 4%, 97%, 1);
  --light-blue: hsla(215, 19%, 95%, 1);
  --black: hsla(218, 73%, 6%, 1);
  --blue: hsla(215, 57%, 74%, 1);
  --red: hsl(343, 79%, 55%);
  --grey: hsla(180, 2%, 49%, 1);

  --colour-primary: var(--light-blue);
  --colour-background: var(--mint);
  --colour-warning: var(--red);

  --unit-base-px: 4px;
  --unit-base-rem: calc(1rem / 4);

  --font-size-interactive: calc(4 * var(--unit-base-rem));
  --font-size-label: calc(4 * var(--unit-base-rem));
  --font-size-aside: calc(3 * var(--unit-base-rem));
}
</style>
