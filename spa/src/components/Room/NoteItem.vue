<template>
  <li v-bind:style="styleObject" v-on:mousedown="_onMouseDown">
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
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
  },
  methods: {
    _onMouseDown: function(): void {
      this.$emit('boardchange', {
        id: this.$props.id,
        posX: this.$props.posX,
        posY: this.$props.posY,
        moving: true,
      });
    },
    _onMouseUp: function(): void {
      this.$emit('boardchange', {
        id: this.$props.id,
        posX: this.$props.posX,
        posY: this.$props.posY,
        moving: false,
      });
    },
    _onMouseMove: function(event: MouseEvent): void {
      if (this.moving) {
        this.$emit('boardchange', {
          id: this.id,
          posX: this.posX + event.movementX,
          posY: this.posY + event.movementY,
          moving: this.moving,
        });
      }
    },
  },
});
</script>

<style scoped>
li {
  position: fixed;
  border: red solid;
  display: inline-block;
  margin: 0 10px;
  cursor: grab;
}
</style>
