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
    <button v-on:click="_onAddItem" aria-label="Add" type="button">+</button>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import RoomBoardItem from './RoomBoardItem.vue';
import {
  LOCK_ROOM_BOARD_ITEM_MUTATION,
  LockRoomBoardItemInput,
  UNLOCK_ROOM_BOARD_ITEM_MUTATION,
  UnlockRoomBoardItemInput,
  UPDATE_ROOM_BOARD_ITEM_MUTATION,
  UpdateRoomBoardItemsInput,
  ADD_ROOM_BOARD_ITEM_MUTATION,
  AddRoomBoardItemInput,
} from './roomGraphQLQuery';
import {
  Interaction,
  InteractionEndEventPayload,
  InteractionMovedEventPayload,
  InteractionStartEventPayload,
} from '@/components/Room/RoomBoardTypes';
import buildItem, { Item } from '@/components/Room/itemBuilder';

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
    _onAddItem: function(): void {
      const newItem = buildItem();
      this.itemsData = [...this.itemsData, newItem];

      const mutationPayload: AddRoomBoardItemInput = {
        posY: newItem.posY,
        posX: newItem.posX,
        roomId: this.roomId,
        itemId: newItem.id,
      };
      this.$apollo
        .mutate({
          mutation: ADD_ROOM_BOARD_ITEM_MUTATION,
          variables: {
            input: mutationPayload,
          },
        })
        .catch(error => {
          console.error(error);
        });
    },
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
    _onBoardItemInteractionStart: function(
      payload: InteractionStartEventPayload
    ) {
      this.interactions = {
        ...this.interactions,
        [payload.interactionId]: {
          itemId: payload.itemId,
          action: payload.action,
        },
      };

      this.movingItemIds = [...this.movingItemIds, payload.itemId];
      const mutationPayload: LockRoomBoardItemInput = {
        roomId: this.roomId,
        itemId: payload.itemId,
        meId: this.myId,
      };
      this.$apollo
        .mutate({
          mutation: LOCK_ROOM_BOARD_ITEM_MUTATION,
          variables: {
            input: mutationPayload,
          },
        })
        .catch(error => {
          console.error(error);
        });
    },
    _onBoardItemInteractionMoved: function({
      interactionId,
      movementX,
      movementY,
    }: InteractionMovedEventPayload) {
      const interaction = this.interactions[interactionId];
      if (!interaction || (movementX === 0 && movementY === 0)) {
        return;
      }

      const index = this.itemsData.findIndex(e => e.id === interaction.itemId);
      this.itemsData = [
        ...this.itemsData.slice(0, index),
        {
          ...this.itemsData[index],
          posX: Math.max(0, this.itemsData[index].posX + movementX),
          posY: Math.max(0, this.itemsData[index].posY + movementY),
          lockedBy: this.myId,
        },
        ...this.itemsData.slice(index + 1),
      ];
    },
    _onBoardItemInteractionFinish: function({
      interactionId,
    }: InteractionEndEventPayload): void {
      const interaction = this.interactions[interactionId];

      if (!interaction) {
        return;
      }

      const item = this.itemsData.find(i => i.id === interaction.itemId);

      if (!item) {
        return;
      }

      if (this.interactions[interactionId]) {
        this.movingItemIds = this.movingItemIds.filter(
          id => id !== this.interactions[interactionId].itemId
        );
        this.interactions = {};
      }

      //TODO just update the single item
      const updateRoomBoardItemsPayload: UpdateRoomBoardItemsInput = {
        id: this.roomId,
        items: this.itemsData.map(entry => ({
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
            input: updateRoomBoardItemsPayload,
          },
        })
        .catch(error => {
          console.error(error);
        });

      const mutationPayload: UnlockRoomBoardItemInput = {
        roomId: this.roomId,
        itemId: item.id,
        meId: this.myId,
      };
      this.$apollo
        .mutate({
          mutation: UNLOCK_ROOM_BOARD_ITEM_MUTATION,
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
ul {
  list-style-type: none;
  padding: 0;
}

button {
  position: absolute;
  width: calc(16 * var(--unit-base-rem));
  height: calc(16 * var(--unit-base-rem));
  bottom: calc(8 * var(--unit-base-rem));
  right: calc(8 * var(--unit-base-rem));
  border-radius: 100%;
  border-width: var(--unit-base-rem);
  font-size: var(--font-size-interactive);
}

section section {
  display: block;
}
</style>
