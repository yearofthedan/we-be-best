<template>
  <ul>
    <li v-for="member in this.members" :key="member">
      {{ _getAvatar() }} {{ member }}
    </li>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue';
import { getRandom } from '@/components/Room/avatars';

export default Vue.extend({
  name: 'room-members',
  props: {
    members: {
      type: Array,
      required: true,
    },
  },
  methods: {
    _getAvatar: getRandom,
  },
});
</script>

<style scoped>
ul {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  grid-row-gap: calc(2 * var(--unit-base-rem));
  padding: calc(2 * var(--unit-base-rem));
  font-size: var(--font-size-label);
  background-color: var(--colour-primary);
  margin: 0;
}
ul > li {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
