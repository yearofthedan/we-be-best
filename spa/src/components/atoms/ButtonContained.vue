<template>
  <button
    v-bind="$attrs"
    :data-action-state="state"
    @click="$emit('click', $event)"
    :disabled="this.disabled"
  >
    <slot></slot>
  </button>
</template>
<script lang="ts">
import Vue from 'vue';
import { ACTION_STATE } from '@/components/atoms/buttonStates';

export default Vue.extend({
  name: 'button-contained',
  props: {
    state: {
      type: String as () => ACTION_STATE,
      required: false,
      default: ACTION_STATE.READY,
    },
  },
  computed: {
    disabled: function () {
      return (
        this.state === ACTION_STATE.LOADING ||
        this.state === ACTION_STATE.SUCCESS
      );
    },
  },
});
</script>
<style scoped>
button {
  height: var(--button-height);
  border-radius: calc(1 * var(--unit-base-rem));
  font-size: var(--font-size-button);
  text-transform: uppercase;
  position: relative;
  background-color: var(--colour-primary);
  color: var(--colour-primary-text);
}

button[data-action-state='loading'] {
  outline: none;
  background-color: var(--colour-disabled);
  color: var(--colour-disabled);
}

button[data-action-state='loading']::before {
  --spinner-radius: calc(2 * var(--unit-base-rem));
  content: '';
  position: absolute;
  width: calc(2 * var(--spinner-radius));
  height: calc(2 * var(--spinner-radius));
  border-top: 2px solid var(--colour-primary-emphasis);
  animation: 2s rotate linear infinite;
  border-radius: 100%;
  left: calc(50% - var(--spinner-radius));
}

button[data-action-state='success'] {
  outline: none;
  background-color: var(--colour-background);
  color: var(--colour-background);
  border: var(--colour-background);
}

button[data-action-state='success']::before {
  --radius: calc(2 * var(--unit-base-rem));
  content: '✔';
  position: absolute;
  width: calc(2 * var(--radius));
  height: calc(2 * var(--radius));
  left: calc(50% - var(--radius));
  bottom: calc(50% - var(--radius));
  border: solid var(--colour-primary-emphasis) var(--unit-base-rem);
  border-radius: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
