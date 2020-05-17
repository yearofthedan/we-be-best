<template>
  <section>
    <ul>
      <note-item v-bind="note123" v-on:boardchange="_onBoardChange" />
    </ul>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import NoteItem from './NoteItem.vue';

export default Vue.extend({
  name: 'shared-board',
  components: {
    'note-item': NoteItem,
  },
  data: () => {
    const data: {
      [id: string]: {
        id: string;
        xPos: number;
        yPos: number;
        moving: boolean;
      };
    } = {
      note123: {
        id: 'note123',
        xPos: 10,
        yPos: 10,
        moving: false,
      },
    };
    return data;
  },
  methods: {
    _onBoardChange: function(note: {
      id: string;
      xPos: number;
      yPos: number;
      moving: boolean;
    }) {
      this[note.id].xPos = note.xPos;
      this[note.id].yPos = note.yPos;
      this[note.id].moving = note.moving;
    },
  },
});
</script>

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
