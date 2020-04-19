<template>
  <li v-bind:style="styleObject" v-on:mousedown="onMouseDown">
    Test
  </li>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "NoteItem",
  props: {
    msg: String
  },
  created: function() {
    window.addEventListener("mousemove", event => {
      if (this.moving) {
        this.curr.left += event.movementX;
        this.curr.top += event.movementY;

        this.styleObject.left = `${this.curr.left}px`;
        this.styleObject.top = `${this.curr.top}px`;
        const socket = (this as any).$socket;
        socket.send(JSON.stringify({
          type: 'NOTE_MOVED',
          by: 'DAN',
          newX: `${this.curr.left}px`,
          newY: `${this.curr.top}px`
        }));
      }
    });
    window.addEventListener("mouseup", () => {
      this.moving = false;
    });
  },
  destroyed: function() {
    //tbd
  },
  data: () => ({
    moving: false,
    curr: {
      top: 100,
      left: 100
    },
    styleObject: {
      top: "100px",
      left: "100px",
      color: "yellow"
    }
  }),
  methods: {
    onMouseDown: function() {
      this.moving = true;
    }
  }
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
