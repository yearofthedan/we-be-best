<template>
  <section>
    <ul>
      <room-board-item
        v-for="item in itemsData"
        v-bind="item"
        v-bind:locked-by="item.lockedBy !== myId ? item.lockedBy : undefined"
        v-bind:moving="movingItemIds.includes(item.id)"
        v-on:interactionstart="_onBoardItemInteractionStart"
        :key="item.id"
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
import {
  InteractionStartEventPayload,
  InteractionEndEventPayload,
  InteractionMovedEventPayload,
  Interaction,
} from '@/components/Room/RoomBoardTypes';

interface Item {
  id: string;
  posX: number;
  posY: number;
  lockedBy?: string;
}

export default Vue.extend({
  name: 'board',
  components: {
    'room-board-item': RoomBoardItem,
  },
  props: {
    myId: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    items: {
      type: Array as () => Item[],
      required: true,
    },
  },
  watch: {
    items: function(newVal) {
      this.itemsData = newVal;
    },
  },
  data: function(): {
    itemsData: Item[];
    interactions: { [interactionId: string]: Interaction };
    movingItemIds: string[];
  } {
    return {
      itemsData: this.$props.items,
      interactions: {},
      movingItemIds: [],
    };
  },
  mounted() {
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
  },
  methods: {
    _onPointerUp: function({ pointerId }: PointerEvent): void {
      this._onBoardItemInteractionFinish({
        interactionId: pointerId.toString(),
      });
    },
    _onPointerMove: function({
      pointerId,
      movementX,
      movementY,
    }: PointerEvent): void {
      this._onBoardItemInteractionMoved({
        interactionId: pointerId.toString(),
        movementX,
        movementY,
      });
    },
    _onBoardItemInteractionFinish: function({
      interactionId,
    }: InteractionEndEventPayload): void {
      if (this.interactions[interactionId]) {
        this.movingItemIds = this.movingItemIds.filter(
          id => id !== this.interactions[interactionId].itemId
        );
        this.interactions = {};
      }
    },
    _onBoardItemInteractionStart: function(
      payload: InteractionStartEventPayload
    ) {
      this.interactions[payload.interactionId] = {
        itemId: payload.itemId,
        action: payload.action,
      };
      this.movingItemIds = [...this.movingItemIds, payload.itemId];
    },
    _onBoardItemInteractionMoved: function({
      interactionId,
      movementX,
      movementY,
    }: InteractionMovedEventPayload) {
      const interaction = this.interactions[interactionId];
      if (!interaction) {
        return;
      }

      const index = this.itemsData.findIndex(e => e.id === interaction.itemId);
      const updated: Item[] = [
        ...this.itemsData.slice(0, index),
        {
          ...this.itemsData[index],
          posX: Math.max(0, this.itemsData[index].posX + movementX),
          posY: Math.max(0, this.itemsData[index].posY + movementY),
          lockedBy: this.myId,
        },
        ...this.itemsData.slice(index + 1),
      ];

      this.itemsData = updated;

      const mutationPayload: UpdateRoomBoardItemsInput = {
        id: this.roomId,
        items: updated.map(entry => ({
          id: entry.id,
          lockedBy: entry.lockedBy,
          posX: entry.posX,
          posY: entry.posY,
        })),
      };
      this.$apollo
        .mutate({
          mutation: UPDATE_ROOM_BOARD_ITEM_MUTATION,
          variables: {
            input: mutationPayload,
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
