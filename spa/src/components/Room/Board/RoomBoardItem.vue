<template>
  <li
    v-bind:style="styleObject"
    v-bind:id="elementId"
    v-on:pointerdown="_onPointerDown"
    v-on:dblclick="_onEditClick"
    v-bind:data-moving="moving"
    v-bind:data-editing="editing"
    v-bind:data-locked-by="lockedBy"
  >
    <template v-if="editing">
      <auto-expanding-text-box v-model="textData" />
      <button aria-label="save" v-on:click="_onSaveClick">✔️</button>
    </template>
    <template v-else>
      {{ text }}
    </template>
  </li>
</template>
<script lang="ts">
import Vue from 'vue';
import { ActionType } from '@/components/Room/Board/RoomBoardTypes';
import {
  UPDATE_BOARD_ITEM_TEXT_MUTATION,
  UpdateBoardItemTextInput,
} from '@/components/Room/Board/boardItemsGraphQL';
import AutoExpandingTextBox from '@/components/Room/Board/AutoExpandingTextBox.vue';

export default Vue.extend({
  name: 'room-board-item',
  components: {
    'auto-expanding-text-box': AutoExpandingTextBox,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    posX: {
      type: Number,
      required: true,
    },
    posY: {
      type: Number,
      required: true,
    },
    moving: {
      type: Boolean,
    },
    text: {
      type: String,
    },
    lockedBy: {
      type: String,
    },
  },
  data(): { editing: boolean; textData: string } {
    return { editing: false, textData: this.text };
  },
  computed: {
    styleObject: function () {
      return {
        left: `${this.posX}px`,
        top: `${this.posY}px`,
      };
    },
    elementId: function () {
      return `item-${this.id}`;
    },
  },
  methods: {
    _onSaveClick: async function (): Promise<void> {
      const mutationPayload: UpdateBoardItemTextInput = {
        id: this.id,
        text: this.textData,
      };

      try {
        await this.$apollo.mutate({
          mutation: UPDATE_BOARD_ITEM_TEXT_MUTATION,
          variables: {
            input: mutationPayload,
          },
        });
        this.editing = false;
      } catch (e) {
        console.error(e);
      }
    },
    _onEditClick: function (): void {
      this.editing = true;
    },
    _onPointerDown: function (event: PointerEvent): void {
      if (this.lockedBy) {
        return;
      }

      this.$emit('interactionstart', {
        itemId: this.$props.id,
        interactionId: event.pointerId,
        action: ActionType.MOVING,
      });
    },
  },
});
</script>

<style scoped>
li[data-locked-by]::before {
  content: attr(data-locked-by);
  border-radius: 100%;
  padding: var(--unit-base-rem);
  position: absolute;
  top: calc(100% - 20px);
  left: calc(100% - 20px);
}

li[data-moving] {
  box-shadow: 0 1px 3px 1px var(--colour-primary-emphasis);
  cursor: none;
}

li[data-editing] {
  padding: 0;
  display: flex;
  flex-direction: column;
  width: fit-content;
}

li textarea {
  padding: calc(2 * var(--unit-base-rem));
  width: inherit;
  height: inherit;
  outline: none;
  resize: none;
  overflow: auto;
}

li {
  box-shadow: 0 1px 3px 1px var(--colour-primary-emphasis);
  background: var(--colour-primary);
  position: absolute;
  border: calc(2 * var(--unit-base-rem)) var(--colour-primary) solid;
  padding: calc(2 * var(--unit-base-rem));
  width: 80px;
  height: fit-content;
  display: inline-block;
  margin: 0 10px;
  cursor: grab;
  user-select: none;
  word-wrap: break-spaces;
  text-overflow: ellipsis;
  touch-action: none;
}

textarea {
  width: inherit;
  white-space: pre;
}
</style>
