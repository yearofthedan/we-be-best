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
    posX: Number,
    posY: Number,
    moving: Boolean,
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
  created: function() {
    window.addEventListener('mousemove', event => {
      if (this.moving) {
        this.$emit('boardchange', {
          id: this.id,
          posX: this.posX + event.movementX,
          posY: this.posY + event.movementY,
          moving: this.moving,
        });
      }
    });
    window.addEventListener('mouseup', () => {
      this.$emit('boardchange', {
        id: this.id,
        posX: this.posX,
        posY: this.posY,
        moving: false,
      });
    });
  },
  methods: {
    _onMouseDown: function(): void {
      this.$emit('boardchange', {
        id: this.id,
        posX: this.posX,
        posY: this.posY,
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
