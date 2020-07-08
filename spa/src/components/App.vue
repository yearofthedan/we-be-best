<template>
  <main id="app">
    <router-view />
  </main>
</template>

<script>
import Vue from 'vue';

const welcomeMessage = `
        ⚠️ These are public rooms so ids can be guessed
        ⚠️ Data is destroyed when nobody is using the app for a while
        ✅ Use the export feature to keep your data
    `;

export default Vue.extend({
  name: 'app',
  mounted() {
    this.$toasted.show(welcomeMessage, {
      duration: 80000,
      position: 'bottom-center',
      containerClass: 'privacy-toast-container',
      className: 'privacy-toast',
    });
  },
});
</script>
<style>
.privacy-toast {
  white-space: pre;
  line-height: 24px !important;
  padding-bottom: 0 !important;
  padding-top: 0 !important;
}
.privacy-toast-container {
  opacity: 70%;
}
.toasted-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

* {
  box-sizing: border-box;
}
body,
main {
  min-height: 100vh;
  overflow: hidden;
}

button {
  user-select: none;
}

body,
h1,
h2,
dd,
dt,
dl {
  margin: 0;
}

article {
  height: 100vh;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;

  --white: hsla(0, 100%, 100%, 1);
  --mint: hsla(107, 4%, 97%, 1);
  --light-blue: hsla(215, 100%, 96%, 1);
  /*--dark-blue: #1e2b76;*/
  --black: hsla(218, 73%, 6%, 1);
  --blue: hsl(223, 55%, 51%);
  --red: hsl(343, 79%, 55%);
  --grey: hsl(180, 3%, 61%);
  --light-grey: hsl(180, 9%, 86%);

  --light-cyan: hsla(182, 100%, 88%, 1);
  --light-pink: hsla(332, 92%, 80%, 1);
  --light-orange: hsla(29, 100%, 79%, 1);
  --whitest-white: hsla(0, 100%, 100%, 1);
  --blackest-black: hsla(0, 0%, 0%, 1);
  --gold-leaf: hsla(43, 74%, 49%, 1);

  --colour-primary: var(--light-blue);
  --colour-primary-text: var(--black);
  --colour-primary-emphasis: var(--blue);
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
  --font-size-icon-button: calc(8 * var(--unit-base-rem));

  --z-index-fab: 10000;
  --z-index-board-item: 1000;
  --z-index-board-item-moving: 2000;
  background-color: var(--colour-background);
}
</style>
