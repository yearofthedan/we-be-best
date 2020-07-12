<template>
  <section>
    <button-action
      @click="$emit('zoom-out', $event)"
      aria-label="zoom out"
      type="button"
    >
      🔍-
    </button-action>
    <button-action
      @click="$emit('zoom-in', $event)"
      aria-label="zoom in"
      type="button"
    >
      🔍+
    </button-action>
    <button-contained
      @click="$emit('add-item', $event)"
      aria-label="Add"
      type="button"
      >Add item</button-contained
    >
    <label
      >Background
      <select
        v-model="selectedBackground"
        v-on:change="$emit('change-background', $event.target.value)"
      >
        <option disabled value="">Please select one</option>
        <option
          v-for="option in backgroundOptions"
          :key="option"
          v-bind:value="option"
        >
          <input type="radio" />
          {{ option }}
        </option>
      </select>
    </label>
  </section>
</template>
<script lang="ts">
import Vue from 'vue';
import ButtonAction from '@/components/atoms/ButtonAction.vue';
import ButtonContained from '@/components/atoms/ButtonContained.vue';

const BACKGROUND_OPTIONS = ['BLANK', 'HALF', 'THIRDS', 'QUADRANTS'];

export default Vue.extend({
  name: 'room-board-controls',
  components: {
    'button-action': ButtonAction,
    'button-contained': ButtonContained,
  },
  data: (): {
    backgroundOptions: string[];
    selectedBackground: string | null;
    focusedId: string;
  } => {
    return {
      backgroundOptions: BACKGROUND_OPTIONS,
      selectedBackground: null,
      focusedId: 'BLANK',
    };
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
  padding: 0 calc(2 * var(--unit-base-rem));
  border-radius: 0 0 calc(2 * var(--unit-base-rem))
    calc(2 * var(--unit-base-rem));
  transform: translate(-50%, 0);
  left: 50%;
  top: 0;
  background: var(--colour-primary);
  box-shadow: 1px 1px 2px 0px var(--colour-shadow);
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

label {
  position: relative;
}
ul {
  outline: none;
  list-style: none;
  position: absolute;
}

ul:not(:focus) > li {
  height: 0;
  width: 0;
  opacity: 0;
}

li[data-focussed] {
  border: solid 1px black;
  height: 20px;
}
</style>
