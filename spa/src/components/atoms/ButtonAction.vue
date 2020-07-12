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
  border: none;
  border-radius: 100%;
  width: var(--button-height);
  height: var(--button-height);
  cursor: pointer;
  background: inherit;
  color: inherit;
  line-height: 0;
  transition: filter 300ms;
}

button:hover {
  filter: brightness(120%);
}
button:active {
  filter: brightness(100%);
  transition: filter 1s;
}

button:focus {
  box-shadow: 0 0 0 2px var(--colour-primary-emphasis);
}
</style>
