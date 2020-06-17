<template>
  <div
    role="textbox"
    contenteditable="plaintext-only"
    v-on:input="$emit('input', $event.target.innerText)"
  >
    {{ value }}
  </div>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'auto-expanding-text-box',
  model: {
    event: 'input',
  },
  props: {
    value: {
      type: String,
    },
  },
});
</script>

<style scoped>
textarea {
  padding: calc(2 * var(--unit-base-rem));
  width: inherit;
  height: inherit;
  outline: none;
  resize: none;
  overflow: auto;
  white-space: pre;
}
</style>
