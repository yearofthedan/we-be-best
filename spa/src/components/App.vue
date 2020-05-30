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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
