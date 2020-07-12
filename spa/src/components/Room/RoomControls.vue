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
    <select
      aria-label="Background"
      v-model="selectedBackground"
      v-on:change="$emit('change-background', $event.target.value)"
    >
      <option disabled value="">Please select one</option>
      <option
        v-bind:selected="option === selectedBackground"
        v-for="option in backgroundOptions"
        :key="option"
        v-bind:value="option"
      >
        <input type="radio" />
        {{ option }}
      </option>
    </select>
    <button-action
      aria-label="download data"
      v-on:click="$emit('export', $event)"
    >
      ⬇
    </button-action>
    <button-contained aria-label="copy room link" v-on:click="$emit('share')">
      📄 Copy link
    </button-contained>
  </section>
</template>
<script lang="ts">
import Vue from 'vue';
import ButtonAction from '@/components/atoms/ButtonAction.vue';
import ButtonContained from '@/components/atoms/ButtonContained.vue';

const BACKGROUND_OPTIONS = ['BLANK', 'HALF', 'THIRDS', 'QUADRANTS'];

export default Vue.extend({
  name: 'room-controls',
  components: {
    'button-action': ButtonAction,
    'button-contained': ButtonContained,
  },
  props: {
    background: {
      type: String,
      required: true,
    },
  },
  data: function (): {
    backgroundOptions: string[];
    selectedBackground: string;
    focusedId: string;
  } {
    return {
      backgroundOptions: BACKGROUND_OPTIONS,
      selectedBackground: this.background,
      focusedId: 'BLANK',
    };
  },
});
</script>

<style scoped>
section {
  position: fixed;
  display: grid;
  grid-template-columns: repeat(6, max-content);
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
</style>
