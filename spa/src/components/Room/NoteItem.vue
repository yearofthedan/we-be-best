<template>
  <li v-bind:style="styleObject" v-on:pointerdown="_onPointerDown" v-bind:moving="moving">
    Test
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'note-item',
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
  },
  computed: {
    styleObject: function() {
      return {
        left: `${this.posX}px`,
        top: `${this.posY}px`,
        color: 'yellow',
      };
    },
  },
  mounted() {
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
  },
  methods: {
    _onPointerDown: function(): void {
      this.$emit('boardchange', {
        id: this.$props.id,
        posX: this.$props.posX,
        posY: this.$props.posY,
        moving: true,
      });
    },
    _onPointerUp: function(): void {
      this.$emit('boardchange', {
        id: this.$props.id,
        posX: this.$props.posX,
        posY: this.$props.posY,
        moving: false,
      });
    },
    _onPointerMove: function(event: PointerEvent): void {
      if (this.moving) {
        this.$emit('boardchange', {
          id: this.id,
          posX: Math.max(0, this.posX + event.movementX),
          posY: Math.max(0, this.posY + event.movementY),
          moving: this.moving,
        });
      }
    },
  },
});
</script>

<style scoped>
li[moving] {
  box-shadow: 0px 1px 3px 1px blue;
  cursor: none;
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
