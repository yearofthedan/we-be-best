<template>
  <div id="app">
    <shared-board />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import SharedBoard from "./components/SharedBoard.vue";

export default Vue.extend({
  name: "app",
  components: {
    "shared-board": SharedBoard
  }
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
