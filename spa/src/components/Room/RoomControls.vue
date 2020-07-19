<template>
  <section>
    <button-action
      @click="$emit('zoom-out', $event)"
      aria-label="zoom out"
      type="button"
    >
      <i class="ri-zoom-out-line"></i>
    </button-action>
    <button-action
      @click="$emit('zoom-in', $event)"
      aria-label="zoom in"
      type="button"
    >
      <i class="ri-zoom-in-line"></i>
    </button-action>
    <button-action
      @click="$emit('add-note', $event)"
      aria-label="Add note"
      type="button"
      ><i class="ri-sticky-note-fill"></i>
    </button-action>
    <label>
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
    </label>
    <a
      href="placeholder for data download"
      v-bind:download="`we-be-best-room-${roomId}.json`"
      aria-label="download data"
      v-on:click="$emit('export', $event)"
    >
      <i
        v-on:click="
          'return false';


        "
        class="ri-file-chart-fill"
      ></i>
    </a>
    <button-action aria-label="copy room link" v-on:click="$emit('share')">
      <i class="ri-links-line"></i>
    </button-action>
  </section>
</template>
<script lang="ts">
import Vue from 'vue';
import ButtonAction from '@/components/atoms/ButtonAction.vue';

const BACKGROUND_OPTIONS = ['BLANK', 'HALF', 'THIRDS', 'QUADRANTS'];

export default Vue.extend({
  name: 'room-controls',
  components: {
    'button-action': ButtonAction,
  },
  props: {
    background: {
      type: String,
      required: true,
    },
    roomId: {
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
  padding: calc(2 * var(--unit-base-rem));
  border-radius: 0 0 calc(2 * var(--unit-base-rem))
    calc(2 * var(--unit-base-rem));
  transform: translate(-50%, 0);
  left: 50%;
  top: 0;
  background: var(--colour-primary);
  color: var(--colour-primary-text);
  box-shadow: 1px 1px 2px 0px var(--colour-shadow);
}

label {
  position: relative;
}
</style>
