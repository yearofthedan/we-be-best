<template>
  <main id="app">
    <joined-room room-id="123" />
  </main>
</template>

<script lang="ts">
import Vue from 'vue';
import JoinedRoom from '@/components/Room/JoinedRoom.vue';

export default Vue.extend({
  name: 'app',
  components: {
    'joined-room': JoinedRoom,
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
