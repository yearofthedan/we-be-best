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
    id: String,
    xPos: Number,
    yPos: Number,
    moving: Boolean,
  },
  computed: {
    styleObject: function() {
      return {
        left: `${this.xPos}px`,
        top: `${this.yPos}px`,
        color: 'yellow',
      };
    },
  },
  created: function() {
    window.addEventListener('mousemove', event => {
      if (this.moving) {
        this.$emit('boardchange', {
          id: this.id,
          xPos: this.xPos + event.movementX,
          yPos: this.yPos + event.movementY,
          moving: this.moving,
        });
      }
    });
    window.addEventListener('mouseup', () => {
      this.$emit('boardchange', {
        id: this.id,
        xPos: this.xPos,
        yPos: this.yPos,
        moving: false,
      });
    });
  },
  methods: {
    _onMouseDown: function(): void {
      this.$emit('boardchange', {
        id: this.id,
        xPos: this.xPos,
        yPos: this.yPos,
        moving: true,
      });
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
