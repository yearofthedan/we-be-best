<template>
  <section>
    <ul>
      <room-board-item
        v-for="item in this.items"
        v-bind="item"
        :key="item.id"
        v-on:roomboardchange="_onRoomBoardChange"
      />
    </ul>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import RoomBoardItem from './RoomBoardItem.vue';
import {
  UPDATE_ROOM_BOARD_ITEM_MUTATION,
  UpdateRoomBoardItemsInput,
} from './roomGraphQLQuery';

interface Item {
  id: string;
  posX: number;
  posY: number;
  moving: boolean;
}

export default Vue.extend({
  name: 'board',
  components: {
    'room-board-item': RoomBoardItem,
  },
  props: {
    roomId: {
      type: String,
      required: true,
    },
    items: {
      type: Array as () => Item[],
      required: true,
    },
  },
  methods: {
    _onRoomBoardChange: function(item: {
      id: string;
      posX: number;
      posY: number;
      moving: boolean;
    }) {
      const index = this.items.findIndex(el => el.id === item.id);

      const updated: Item[] = [
        ...this.items.slice(0, index),
        {
          id: item.id,
          posX: item.posX,
          posY: item.posY,
          moving: item.moving,
        },
        ...this.items.slice(index + 1),
      ];

      const payload: UpdateRoomBoardItemsInput = {
        id: this.roomId,
        items: updated,
      };

      this.$apollo
        .mutate({
          mutation: UPDATE_ROOM_BOARD_ITEM_MUTATION,
          variables: {
            input: payload,
          },
          optimisticResponse: {
            __typename: 'Mutation',
            updateRoomBoardItems: {
              __typename: 'Room',
              id: this.roomId,
              items: updated.map(item => ({
                __typename: 'Item',
                ...item,
              })),
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
