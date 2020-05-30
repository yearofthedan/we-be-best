<template>
  <li
    v-bind:style="styleObject"
    v-on:pointerdown="_onPointerDown"
    v-bind:data-moving="moving"
    v-bind:data-locked-by="lockedBy"
  >
    {{ id }}
  </li>
</template>

<script lang="ts">
import Vue from 'vue';
import { ActionType } from '@/components/Room/RoomBoardTypes';

export default Vue.extend({
  name: 'room-board-item',
  props: {
    id: {
      type: String,
      required: true,
    },
    posX: {
      type: Number,
      required: true,
    },
    posY: {
      type: Number,
      required: true,
    },
    moving: {
      type: Boolean,
      required: true,
    },
    lockedBy: {
      type: String,
    },
  },
  computed: {
    styleObject: function() {
      return {
        left: `${this.posX}px`,
        top: `${this.posY}px`,
      };
    },
  },
  methods: {
    _onPointerDown: function(event: PointerEvent): void {
      if (this.lockedBy) {
        return;
      }

      this.$emit('interactionstart', {
        itemId: this.$props.id,
        interactionId: event.pointerId,
        action: ActionType.MOVING,
      });
    },
  },
});
</script>

<style scoped>
li[data-moving] {
  box-shadow: 0px 1px 3px 1px blue;
  cursor: none;
}
li[data-locked-by]::before {
  content: attr(data-locked-by);
  background: white;
  border: solid 1px;
  border-radius: 100%;
  padding: 4px;
  position: absolute;
  top: calc(100% - 20px);
  left: calc(100% - 20px);
}

li {
  position: fixed;
  border: grey solid;
  width: 80px;
  height: 80px;
  display: inline-block;
  margin: 0 10px;
  cursor: grab;
  user-select: none;
}
</style>
