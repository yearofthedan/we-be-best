<template>
  <div v-once
    role="textbox"
    contenteditable
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
[role=textbox] {
  background-color: var(--colour-background);
  width: inherit;
  outline: none;
  resize: none;
  white-space: inherit;
  flex: 1;
}
</style>
