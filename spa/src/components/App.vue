<template>
  <main id="app">
    <router-view />
  </main>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  name: 'app',
});
</script>
<style>
.toasted-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

* {
  box-sizing: border-box;
}
body {
  min-height: 100vh;
  font-size: 16px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background-color: var(--colour-shadow);
  min-width: 100%;
  max-width: fit-content;
}

main {
  min-height: 100vh;
  background-color: var(--colour-shadow);
}

button {
  user-select: none;
}

body,
h1,
h2,
dd,
dt,
dl,
ul {
  margin: 0;
}

article {
  height: 100vh;
}
#app {
  --white: hsla(0, 100%, 100%, 1);
  --mint: hsla(107, 4%, 97%, 1);
  --light-blue: hsla(215, 100%, 96%, 1);
  --black: hsl(220, 4%, 27%);
  --blue: hsl(223, 55%, 51%);
  --dark-blue: hsl(223, 50%, 21%);
  --red: hsl(343, 79%, 55%);
  --grey: hsl(180, 3%, 61%);
  --light-grey: hsl(180, 9%, 86%);

  --light-cyan: hsla(182, 100%, 88%, 1);
  --light-pink: hsla(332, 92%, 80%, 1);
  --light-orange: hsla(29, 100%, 79%, 1);
  --whitest-white: hsla(0, 100%, 100%, 1);
  --blackest-black: hsla(0, 0%, 0%, 1);
  --gold-leaf: hsla(43, 74%, 49%, 1);

  --colour-primary: var(--blue);
  --colour-primary-text: var(--white);
  --colour-primary-emphasis: var(--dark-blue);
  --colour-secondary: var(--grey);
  --colour-shadow: var(--black);
  --colour-background: var(--white);
  --colour-warning: var(--red);
  --colour-disabled: var(--light-grey);

  --unit-base-px: 4px;
  --unit-base-rem: calc(1rem / 4);

  --font-size-aside: calc(3 * var(--unit-base-rem));
  --font-size-interactive: calc(4 * var(--unit-base-rem));
  --font-size-label: calc(4 * var(--unit-base-rem));
  --font-size-text: calc(6 * var(--unit-base-rem));
  --font-size-button: calc(4 * var(--unit-base-rem));

  --z-index-fab: 10000;
  --z-index-board-note: 1000;
  --z-index-board-note-moving: 2000;

  --button-height: calc(var(--unit-base-rem) * 9);
}

button {
  height: var(--button-height);
  padding: 0;
  margin: 0;
  color: inherit;
}
</style>
