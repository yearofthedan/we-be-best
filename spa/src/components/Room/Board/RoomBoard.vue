<template>
  <transition-group
    name="list"
    aria-label="board"
    tag="ul"
    v-bind:data-room-name="roomId"
    v-on:mousemove="this._onMouseMove"
    v-on:pointermove="this._onPointerMove"
    v-bind:style="`--zoom-factor: ${zoomFactor}`"
    v-bind:data-background="background"
  >
    <room-board-item
      v-for="item in itemsData"
      v-bind:item="item"
      v-bind:moving="_getIsMoving(item.id)"
      v-bind:my-id="myId"
      v-bind:editing="editingItemReference === item.id"
      v-on:pointerheld="_onBoardItemPointerHeld"
      v-on:editstart="_onBoardItemEditStart"
      v-on:editfinish="_onBoardItemEditFinish"
      :key="item.id"
    />
  </transition-group>
</template>

<script lang="ts">
import Vue from 'vue';
import RoomBoardItem from './RoomBoardItem.vue';
import {
  lockRoomBoardItem,
  moveBoardItem,
  unlockRoomBoardItem,
} from '@/graphql/boardQueries.graphql';
import { ItemViewModel } from '@/components/Room/Board/items';
import { patchArrayElement } from '@/common/arrays';
import { supportsTouchEvents } from '@/common/dom';
import {
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
    background: {
      type: String,
      default: 'QUADRANTS',
    },
    items: {
      type: Array as () => ItemViewModel[],
      required: true,
    },
    myId: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    zoomFactor: {
      type: Number,
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
    heldItemReference: string | null;
    primaryTouchId: string | null;
  } {
    return {
      itemsData: this.$props.items.filter(
        (item: ItemViewModel) => !item.isDeleted
      ),
      movingItemReference: null,
      editingItemReference: null,
      heldItemReference: null,
      primaryTouchId: null,
    };
  },
  mounted() {
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('mouseup', this._onPointerUp);
  },
  methods: {
    _getIsMoving: function (itemId: string): boolean {
      return itemId === this.movingItemReference;
    },
    _onPointerUp: function (): void {
      this._onBoardItemStoppedMoving();
      this.heldItemReference = null;
    },
    _onPointerMove: function (event: PointerEvent): void {
      if (!supportsTouchEvents()) {
        return;
      }
      const { movementX, movementY } = event;

      this.moveItemIfHeld(movementX, movementY);
    },
    _onMouseMove: function (event: MouseEvent): void {
      if (supportsTouchEvents()) {
        return;
      }
      const { movementX, movementY } = event;
      this.moveItemIfHeld(movementX, movementY);
    },
    moveItemIfHeld(movementX: number, movementY: number) {
      if (!this.movingItemReference) {
        if (!this.heldItemReference) {
          return;
        }
        this.movingItemReference = this.heldItemReference;
        this._lockItem(this.heldItemReference);
      }

      this._onBoardItemMoved({
        itemReference: this.movingItemReference,
        movementX,
        movementY,
      });
    },
    _lockItem: function (itemId: string): void {
      const mutationPayload: LockRoomBoardItemInput = {
        id: itemId,
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
          this.$logger.error(error);
          this.$toasted.global.apollo_error(
            `Could not move the item: ${error.message}`
          );
        });
    },
    _onBoardItemPointerHeld: function (payload: ItemPointerEventPayload) {
      this.heldItemReference = payload.itemId;
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
    _onBoardItemMoved: function ({
      itemReference,
      movementX,
      movementY,
    }: ItemMovedEventPayload) {
      const item = this.itemsData.find((e) => e.id === itemReference);
      if (!item) {
        return;
      }
      const { posX, posY } = item;

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
          this.$toasted.global.apollo_error(
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

interface ItemPointerEventPayload {
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
  --zoom-factor: 1;
  transform-origin: top left;
  width: 1280px;
  height: 800px;
  transform: scale(var(--zoom-factor));
  transition: transform 0.2s;
  box-shadow: 0 0 0 2px var(--colour-primary-emphasis);
  background: var(--colour-background);
}

ul[data-background='QUADRANTS'] {
  background: repeating-linear-gradient(
      90deg,
      var(--colour-shadow),
      var(--colour-shadow) var(--unit-base-rem),
      transparent 0,
      transparent 50%
    ),
    repeating-linear-gradient(
      180deg,
      var(--colour-shadow),
      var(--colour-shadow) var(--unit-base-rem),
      var(--colour-background) 0,
      var(--colour-background) 50%
    );
}

ul[data-background='HALF'] {
  background: repeating-linear-gradient(
    90deg,
    var(--colour-secondary),
    var(--colour-secondary) var(--unit-base-rem),
    var(--colour-background) 0,
    var(--colour-background) 50%
  );
}

ul[data-background='THIRDS'] {
  background: repeating-linear-gradient(
    90deg,
    var(--colour-secondary),
    var(--colour-secondary) var(--unit-base-rem),
    var(--colour-background) 0,
    var(--colour-background) 33.33%
  );
}

ul::before {
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
