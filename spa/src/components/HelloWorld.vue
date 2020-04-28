<template>
  <div class="hello">
    <h1>{{ styleObject.left }}, {{ styleObject.top }}</h1>
    <ul>
      <NoteItem />
      <NoteItem />
      <NoteItem />
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import NoteItem from "./NoteItem.vue";

export default Vue.extend({
  name: "HelloWorld",
  components: {
    NoteItem
  },
  created: function() {
    window.addEventListener("mousemove", event => {
      if (this.moving) {
        this.curr.left += event.movementX;
        this.curr.top += event.movementY;

        this.styleObject.left = `${this.curr.left}px`;
        this.styleObject.top = `${this.curr.top}px`;
      }
    });
    window.addEventListener("mouseup", () => {
      this.moving = false;
    });
  },
  data: () => ({
    moving: false,
    curr: {
      top: 100,
      left: 100
    },
    styleObject: {
      top: '100px',
      left: '100px',
      color: 'yellow'
    }
  }),
  methods: {
    onMouseDown: function() {
      this.moving = true;
    },
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  position: fixed;
  border: red solid;
  display: inline-block;
  margin: 0 10px;
  cursor: grab;
}
a {
  color: #42b983;
}
</style>
