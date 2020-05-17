<template>
  <section>
    <ul>
      <note-item
        v-for="note in this.notes"
        v-bind="note"
        :key="note.id"
        v-on:boardchange="_onBoardChange"
      />
    </ul>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import NoteItem from './NoteItem.vue';
import { ROOM_CHANGED_MUTATION } from './roomGraphQLQuery';

interface Note {
  id: string;
  posX: number;
  posY: number;
  moving: boolean;
}

export default Vue.extend({
  name: 'shared-board',
  components: {
    'note-item': NoteItem,
  },
  props: {
    roomId: String,
  },
  data: () => {
    const data: {
      notes: Note[];
    } = {
      notes: [
        {
          id: 'NOTE123',
          posX: 10,
          posY: 10,
          moving: false,
        },
      ],
    };
    return data;
  },
  methods: {
    _onBoardChange: function(note: {
      id: string;
      posX: number;
      posY: number;
      moving: boolean;
    }) {
      const index = this.notes.findIndex(el => el.id === note.id);

      this.notes = [
        ...this.notes.slice(0, index),
        {
          id: note.id,
          posX: note.posX,
          posY: note.posY,
          moving: note.moving,
        },
        ...this.notes.slice(index + 1),
      ];

      this.$apollo
        .mutate({
          mutation: ROOM_CHANGED_MUTATION,
          variables: {
            input: {
              id: this.roomId,
              notes: this.notes,
            },
          },
        })
        .catch(error => {
          console.error(error);
        });
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
