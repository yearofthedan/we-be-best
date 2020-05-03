<template>
  <li v-bind:style="styleObject" v-on:mousedown="_onMouseDown">
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        const socket = this.$socket;
        socket.send(
          JSON.stringify({
            type: "NOTE_MOVED",
            by: "DAN",
            newX: `${this.curr.left}px`,
            newY: `${this.curr.top}px`
          })
        );
      }
    });
    window.addEventListener("mouseup", () => {
      this.moving = false;
    });
  },
  destroyed: function() {
    //tbd
  },
  methods: {
    _onMouseDown: function(): void {
      this.moving = true;
    }
  },
  data(): {
    moving: boolean;
    curr: { top: number; left: number };
    styleObject: { top: string; left: string; color: string };
  } {
    return {
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
    };
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
