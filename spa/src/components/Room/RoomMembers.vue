<template>
  <ul>
    <li v-for="member in this.members" :key="member">
      {{ member }}
    </li>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'room-members',
  props: {
    members: {
      type: Array,
      required: true,
    },
  },
});
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0 calc(2 * var(--unit-base-rem));
}
</style>
