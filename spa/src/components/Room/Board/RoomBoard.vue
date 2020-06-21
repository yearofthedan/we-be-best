<template>
  <section v-bind:data-room-name="roomId">
    <ul>
      <room-board-item
        v-for="item in itemsData"
        v-bind="item"
        v-bind:locked-by="item.lockedBy !== myId ? item.lockedBy : undefined"
        v-bind:moving="_getIsMoving(item.id)"
        v-on:movestart="_onBoardItemMoveStart"
        :key="item.id"
      />
    </ul>
    <button v-on:click="_onAddItem" aria-label="Add" type="button" />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import RoomBoardItem from './RoomBoardItem.vue';
import {
  ADD_ROOM_BOARD_ITEM_MUTATION,
  AddRoomBoardItemInput,
  LOCK_ROOM_BOARD_ITEM_MUTATION,
  LockRoomBoardItemInput,
  MOVE_BOARD_ITEM_MUTATION,
  MoveBoardItemInput,
  UNLOCK_ROOM_BOARD_ITEM_MUTATION,
  UnlockRoomBoardItemInput,
} from './boardItemsGraphQL';
import buildItem, { Item } from '@/components/Room/Board/itemBuilder';
import { patchArrayElement } from '@/common/arrays';

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
    items: function (newVal) {
      this.itemsData = newVal;
    },
  },
  data: function (): {
    itemsData: Item[];
    movingItemsByPointer: { [pointerId: string]: MovingItemReference };
  } {
    return {
      itemsData: this.$props.items.filter((item: Item) => !item.isDeleted),
      movingItemsByPointer: {},
    };
  },
  mounted() {
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
  },
  methods: {
    _getIsMoving: function (itemId: string): boolean {
      //todo would rather this be reactive
      const result = Object.values(this.movingItemsByPointer).find(
        (itemRefs) => itemRefs.itemId === itemId
      );
      return !!result;
    },
    _onAddItem: function (): void {
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
        .catch((error) => {
          console.error(error);
        });
    },
    _onPointerUp: function ({ pointerId }: PointerEvent): void {
      this._onBoardItemStoppedMoving({
        pointerId: pointerId.toString(),
      });
    },
    _onPointerMove: function ({
      pointerId,
      movementX,
      movementY,
    }: PointerEvent): void {
      this._onBoardItemMoved({
        pointerId: pointerId.toString(),
        movementX,
        movementY,
      });
    },
    _onBoardItemMoveStart: function (payload: ItemMoveStartedEventPayload) {
      this.movingItemsByPointer = {
        ...this.movingItemsByPointer,
        [payload.pointerId]: { itemId: payload.itemId },
      };

      const mutationPayload: LockRoomBoardItemInput = {
        id: payload.itemId,
        lockedBy: this.myId,
      };
      this.$apollo
        .mutate({
          mutation: LOCK_ROOM_BOARD_ITEM_MUTATION,
          variables: {
            input: mutationPayload,
          },
        })
        .catch((error) => {
          console.error(error);
        });
    },
    _onBoardItemMoved: function ({
      pointerId,
      movementX,
      movementY,
    }: ItemMovedEventPayload) {
      const itemReference = this.movingItemsByPointer[pointerId];
      if (!itemReference || (movementX === 0 && movementY === 0)) {
        return;
      }
      const { posX, posY } = this.itemsData.find(
        (e) => e.id === itemReference.itemId
      ) as Item;

      this.itemsData = patchArrayElement(
        this.itemsData,
        {
          posX: Math.max(0, posX + movementX),
          posY: Math.max(0, posY + movementY),
          lockedBy: this.myId,
        },
        (e) => e.id === itemReference.itemId
      );
    },
    _onBoardItemStoppedMoving: function ({
      pointerId,
    }: ItemMoveEndedEventPayload): void {
      const itemRef = this.movingItemsByPointer[pointerId];
      if (!itemRef) {
        return;
      }

      const item = this.itemsData.find((i) => i.id === itemRef.itemId);
      if (!item) {
        return;
      }

      //todo this doesn't support multiple items, so bother with an object?
      this.movingItemsByPointer = {};

      const updateRoomBoardItemsPayload: MoveBoardItemInput = {
        id: item.id,
        posX: item.posX,
        posY: item.posY,
      };

      this.$apollo
        .mutate({
          mutation: MOVE_BOARD_ITEM_MUTATION,
          variables: {
            input: updateRoomBoardItemsPayload,
          },
        })
        .catch((error) => {
          console.error(error);
        });

      const mutationPayload: UnlockRoomBoardItemInput = {
        id: item.id,
      };
      this.$apollo
        .mutate({
          mutation: UNLOCK_ROOM_BOARD_ITEM_MUTATION,
          variables: {
            input: mutationPayload,
          },
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
});

interface MovingItemReference {
  itemId: string;
}

interface ItemMoveStartedEventPayload {
  itemId: string;
  pointerId: number;
}

interface ItemMovedEventPayload {
  pointerId: string;
  movementX: number;
  movementY: number;
}

interface ItemMoveEndedEventPayload {
  pointerId: string;
}
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
  font-size: var(--font-size-interactive);
}
button::before {
  content: '+';
  position: absolute;
  font-size: var(--font-size-fab);
  top: -12px;
  right: -12px;
  border-radius: 100%;
  border: 1px solid;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--colour-primary);
}

section section {
  height: 100vh;
}

section::before {
  position: absolute;
  padding-left: calc(4 * var(--unit-base-rem));
  padding-bottom: calc(4 * var(--unit-base-rem));
  bottom: 0;
  font-size: calc(12 * var(--unit-base-rem));
  font-style: italic;
  filter: opacity(15%);
  content: attr(data-room-name);
}
</style>
