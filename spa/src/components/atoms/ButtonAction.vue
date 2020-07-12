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
  font-size: var(--font-size-button);
  text-transform: lowercase;
  border: 2px solid var(--colour-secondary);
  border-radius: 100%;
  width: var(--button-height);
  height: var(--button-height);
  cursor: pointer;
  background: var(--colour-primary);
  color: inherit;
  border-color: inherit;
  line-height: 0;
}

button:focus {
  box-shadow: 0 0 0 2px var(--colour-primary-emphasis);
}
</style>
