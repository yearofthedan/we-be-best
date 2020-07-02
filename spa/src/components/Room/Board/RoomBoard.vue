<template>
  <section
    v-bind:data-room-name="roomId"
    v-on:mousemove="this._onMouseMove"
    v-on:pointermove="this._onPointerMove"
  >
    <transition-group name="list" tag="ul">
      <room-board-item
        v-for="item in itemsData"
        v-bind:item="item"
        v-bind:moving="_getIsMoving(item.id)"
        v-bind:my-id="myId"
        v-bind:editing="editingItemReference === item.id"
        v-on:movestart="_onBoardItemMoveStart"
        v-on:editstart="_onBoardItemEditStart"
        v-on:editfinish="_onBoardItemEditFinish"
        :key="item.id"
      />
    </transition-group>
    <button v-on:click="_onAddItem" aria-label="Add" type="button" />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import RoomBoardItem from './RoomBoardItem.vue';
import {
  addRoomBoardItem,
  lockRoomBoardItem,
  moveBoardItem,
  unlockRoomBoardItem,
} from '@/graphql/boardQueries.graphql';
import makeNewItem, {
  ItemViewModel,
} from '@/components/Room/Board/itemBuilder';
import { patchArrayElement } from '@/common/arrays';
import { supportsTouchEvents } from '@/common/dom';
import {
  AddRoomBoardItemInput,
  LockRoomBoardItemInput,
  MoveBoardItemInput,
  UnlockRoomBoardItemInput,
} from '@type-definitions/graphql';

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
      type: Array as () => ItemViewModel[],
      required: true,
    },
  },
  watch: {
    items: function (newVal) {
      this.itemsData = newVal;
    },
  },
  data: function (): {
    itemsData: ItemViewModel[];
    movingItemReference: string | null;
    editingItemReference: string | null;
    primaryTouchId: string | null;
  } {
    return {
      itemsData: this.$props.items.filter(
        (item: ItemViewModel) => !item.isDeleted
      ),
      movingItemReference: null,
      editingItemReference: null,
      primaryTouchId: null,
    };
  },
  mounted() {
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('mouseup', this._onPointerUp);
  },
  methods: {
    _getIsMoving: function (itemId: string): boolean {
      return itemId === this.movingItemReference;
    },
    _onAddItem: function (): void {
      const newItem = makeNewItem();
      this.itemsData = [...this.itemsData, newItem];
      this.editingItemReference = newItem.id;

      const mutationPayload: AddRoomBoardItemInput = {
        posY: newItem.posY,
        posX: newItem.posX,
        roomId: this.roomId,
        itemId: newItem.id,
      };
      this.$apollo
        .mutate({
          mutation: addRoomBoardItem,
          variables: {
            input: mutationPayload,
          },
        })
        .catch((error) => {
          this.$toasted.global.apollo_error(
            `Could not add a new item: ${error.message}`
          );
        });
    },
    _onPointerUp: function (): void {
      this._onBoardItemStoppedMoving();
    },
    _onPointerMove: function (event: PointerEvent): void {
      if (!supportsTouchEvents()) {
        return;
      }
      const { movementX, movementY } = event;

      if (!this.movingItemReference) {
        return;
      }

      this._onBoardItemMoved({
        itemReference: this.movingItemReference,
        movementX,
        movementY,
      });
    },
    _onMouseMove: function (event: MouseEvent): void {
      if (supportsTouchEvents()) {
        return;
      }
      const { movementX, movementY } = event;

      if (!this.movingItemReference) {
        return;
      }

      this._onBoardItemMoved({
        itemReference: this.movingItemReference,
        movementX,
        movementY,
      });
    },
    _onBoardItemEditStart: function (itemId: string) {
      if (this.editingItemReference) {
        return;
      }
      this.editingItemReference = itemId;
    },
    _onBoardItemEditFinish: function () {
      this.editingItemReference = null;
    },
    _onBoardItemMoveStart: function (payload: ItemMoveStartedEventPayload) {
      this.movingItemReference = payload.itemId;

      const mutationPayload: LockRoomBoardItemInput = {
        id: payload.itemId,
        lockedBy: this.myId,
      };
      this.$apollo
        .mutate({
          mutation: lockRoomBoardItem,
          variables: {
            input: mutationPayload,
          },
        })
        .catch((error) => {
          console.log(error);
          this.$toasted.global.apollo_error(
            `Could not move the item: ${error.message}`
          );
        });
    },
    _onBoardItemMoved: function ({
      itemReference,
      movementX,
      movementY,
    }: ItemMovedEventPayload) {
      if (!itemReference || (movementX === 0 && movementY === 0)) {
        return;
      }

      const { posX, posY } = this.itemsData.find(
        (e) => e.id === itemReference
      ) as ItemViewModel;

      this.itemsData = patchArrayElement(
        this.itemsData,
        {
          posX: Math.max(0, posX + movementX),
          posY: Math.max(0, posY + movementY),
          lockedBy: this.myId,
        },
        (e) => e.id === itemReference
      );
    },
    _onBoardItemStoppedMoving: async function (): Promise<void> {
      const itemRef = this.movingItemReference;
      if (!itemRef) {
        return;
      }

      const item = this.itemsData.find((i) => i.id === itemRef);
      if (!item) {
        return;
      }

      this.movingItemReference = null;

      const updateRoomBoardItemsPayload: MoveBoardItemInput = {
        id: item.id,
        posX: item.posX,
        posY: item.posY,
      };

      await this.$apollo
        .mutate({
          mutation: moveBoardItem,
          variables: {
            input: updateRoomBoardItemsPayload,
          },
        })
        .catch((error) => {
          //todo investigate why these are causing flakiness in tests when not optional
          this.$toasted?.global?.apollo_error(
            `Could not update the item: ${error.message}`
          );
        });

      const mutationPayload: UnlockRoomBoardItemInput = {
        id: item.id,
      };
      await this.$apollo
        .mutate({
          mutation: unlockRoomBoardItem,
          variables: {
            input: mutationPayload,
          },
        })
        .catch((error) => {
          this.$toasted?.global?.apollo_error(
            `Could not update the item: ${error.message}`
          );
        });
    },
  },
});

interface ItemMoveStartedEventPayload {
  itemId: string;
  pointerId: number;
}

interface ItemMovedEventPayload {
  itemReference: string;
  movementX: number;
  movementY: number;
}
</script>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

button {
  position: absolute;
  z-index: var(--z-index-fab);
  width: calc(16 * var(--unit-base-rem));
  height: calc(16 * var(--unit-base-rem));
  bottom: calc(8 * var(--unit-base-rem));
  right: calc(8 * var(--unit-base-rem));
  font-size: var(--font-size-interactive);
}
button::before {
  content: '+';
  position: absolute;
  font-size: var(--font-size-icon-button);
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

.list-enter-active,
.list-leave-active {
  transition: all 0.3s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateX(100%) translateY(100%) scale(1.4);
}
</style>
