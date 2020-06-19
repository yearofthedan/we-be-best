<template>
  <div role="radiogroup">
    <input
      v-for="style in theme"
      :key="style.name"
      v-bind:aria-label="style.name"
      v-bind:value="style.name"
      v-model="selected"
      v-bind:style="{ '--primary-color': style.backgroundColour }"
      v-on:input="
        $emit('input', {
          backgroundColour: style.backgroundColour,
          textColour: style.textColour,
        })
      "
      type="radio"
    />
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import {
  LIGHT_CYAN,
  BLACKEST_BLACK,
  LIGHT_PINK,
  LIGHT_ORANGE,
  WHITEST_WHITE,
  GOLD_LEAF,
} from './itemBuilder';

export default Vue.extend({
  name: 'room-board-item-style-selector',
  props: {
    current: {
      type: String,
    },
  },
  data(): {
    selected: string;
    theme: { name: string; backgroundColour: string; textColour: string }[];
  } {
    return {
      selected: '',
      theme: [
        {
          name: 'style-1',
          backgroundColour: LIGHT_CYAN,
          textColour: BLACKEST_BLACK,
        },
        {
          name: 'style-2',
          backgroundColour: LIGHT_PINK,
          textColour: BLACKEST_BLACK,
        },
        {
          name: 'style-3',
          backgroundColour: LIGHT_ORANGE,
          textColour: BLACKEST_BLACK,
        },
        {
          name: 'style-4',
          backgroundColour: WHITEST_WHITE,
          textColour: BLACKEST_BLACK,
        },
        {
          name: 'style-5',
          backgroundColour: BLACKEST_BLACK,
          textColour: GOLD_LEAF,
        },
      ],
    };
  },
});
</script>

<style scoped>
div {
  --primary-color: placeholder;
  top: -24px;
  width: 100%;
  position: absolute;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
}
input {
  position: relative;
  cursor: default;
  appearance: none;
  width: 10px;
  margin: 0;
}
input::before {
  content: ' ';
  border-radius: 100%;
  box-shadow: 2px 2px 4px 0px var(--colour-secondary);
  background-color: var(--primary-color);
  width: 16px;
  height: 16px;
  left: calc(50% - 8px);
  top: calc(50% - 8px);
  position: absolute;
}
</style>
