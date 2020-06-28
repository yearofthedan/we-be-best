<template>
  <div role="radiogroup">
    <input
      v-for="option in options"
      :key="option.name"
      v-bind:aria-label="option.name"
      v-bind:value="option.name"
      v-model="selected"
      v-bind:style="{ '--primary-color': option.backgroundColour }"
      v-on:input="$emit('input', option.name)"
      type="radio"
    />
  </div>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'room-board-item-style-selector',
  props: {
    current: {
      type: String,
    },
    options: {
      type: Array as () => {
        name: string;
        backgroundColour: string;
        textColour: string;
      }[],
      required: true,
    },
  },
  data(): {
    selected: string;
  } {
    return {
      selected: '',
    };
  },
});
</script>

<style scoped>
div {
  --primary-color: placeholder;
  left: -36px;
  position: absolute;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  height: 160px;
}
input {
  position: relative;
  cursor: default;
  appearance: none;
  width: 0;
  margin: 0;
}
input::before {
  content: ' ';
  position: absolute;
  border-radius: 100%;
  box-shadow: 2px 2px 4px 0px var(--colour-secondary);
  background-color: var(--primary-color);
  width: calc(6 * var(--unit-base-rem));
  height: calc(6 * var(--unit-base-rem));
  left: calc(-2 * var(--unit-base-rem));
}
</style>
