<template>
  <section>
    <button-action
      @click="$emit('zoom-in', $event)"
      aria-label="zoom in"
      type="button"
    >
      +
    </button-action>
    <button-action
      @click="$emit('zoom-out', $event)"
      aria-label="zoom out"
      type="button"
    >
      -
    </button-action>
    <button-contained
      @click="$emit('add-item', $event)"
      aria-label="Add"
      type="button"
      >Add item</button-contained
    >
  </section>
</template>
<script lang="ts">
import Vue from 'vue';
import ButtonAction from '@/components/atoms/ButtonAction.vue';
import ButtonContained from '@/components/atoms/ButtonContained.vue';

export default Vue.extend({
  name: 'room-board-controls',
  components: {
    'button-action': ButtonAction,
    'button-contained': ButtonContained,
  },
});
</script>

<style scoped>
section {
  position: fixed;
  display: grid;
  grid-template-columns: max-content max-content max-content;
  grid-column-gap: calc(2 * var(--unit-base-rem));
  align-items: center;
  height: calc(12 * var(--unit-base-rem));
  transform: translate(-50%, 0);
  left: 50%;
  top: 0;
}

button[aria-label='Zoom Out'] {
  left: 0;
  top: 0;
}

button[aria-label='Zoom In'] {
  left: 30px;
  top: 0;
}

button[aria-label='Add'] {
  position: relative;
  z-index: var(--z-index-fab);
  font-size: var(--font-size-interactive);
}
</style>
