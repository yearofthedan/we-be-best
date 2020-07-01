<template>
  <div
    v-once
    role="textbox"
    contenteditable
    ref="textbox"
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
  mounted() {
    this.focusInput();
  },
  methods: {
    focusInput() {
      (this.$refs.textbox as HTMLDivElement).focus();
    },
  },
});
</script>

<style scoped>
[role='textbox'] {
  width: inherit;
  outline: none;
  resize: none;
  white-space: inherit;
  flex: 1;
}
</style>
