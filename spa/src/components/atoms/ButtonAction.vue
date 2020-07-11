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
  outline: none;
  font-size: var(--font-size-icon-button);
  text-transform: lowercase;
  border: 2px solid var(--colour-secondary);
  border-radius: 100%;
  width: calc(20 * var(--unit-base-rem));
  height: calc(10 * var(--unit-base-rem));
  cursor: pointer;
  background: var(--colour-background);
  color: var(--colour-secondary);
  line-height: 0;
}

button:focus {
  box-shadow: 0 0 0 2px var(--colour-primary-emphasis);
}
</style>
