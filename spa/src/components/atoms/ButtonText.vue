<template>
  <button v-bind="$attrs" @click="$emit('click', $event)">
    <slot></slot>
  </button>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'button-text',
});
</script>
<style scoped>
button {
  font-size: var(--font-size-interactive);
  text-transform: lowercase;
  border: 2px solid var(--colour-primary-emphasis);
  border-radius: var(--unit-base-rem);
  min-height: calc(6 * var(--unit-base-rem));
  width: max-content;
  cursor: pointer;
  background: none;
  color: var(--colour-primary-emphasis);
}
</style>
