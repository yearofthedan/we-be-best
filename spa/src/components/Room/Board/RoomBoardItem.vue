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
      <colour-style-selector v-on:input="_onStyleChange" />
      <auto-expanding-text-box v-model="textData" />
      <button id="save-button" aria-label="save" v-on:click="_onSaveClick">
        <span>✔</span>️️
      </button>
      <button
        id="delete-button"
        aria-label="delete"
        v-on:click="_onDeleteClick"
      >
        <span>🗑</span>️
      </button>
    </template>
    <template v-else>
      {{ text }}
    </template>
  </li>
</template>
<script lang="ts">
import Vue from 'vue';
import {
  DELETE_BOARD_ITEM_MUTATION,
  UPDATE_BOARD_ITEM_TEXT_MUTATION,
  UpdateBoardItemTextInput,
} from '@/components/Room/Board/boardItemsGraphQL';
import AutoExpandingTextBox from '@/components/Room/Board/AutoExpandingTextBox.vue';
import { PRIMARY_MOUSE_BUTTON_ID } from '@/common/dom';
import ColourStyleSelector from '@/components/Room/Board/ColourStyleSelector.vue';

interface MoveStartEventPayload {
  itemId: string;
  pointerId: number;
}

type DataProperties = {
  editing: boolean;
  textData: string;
  style: { backgroundColour?: string; textColour?: string };
};
export default Vue.extend({
  name: 'room-board-item',
  components: {
    'auto-expanding-text-box': AutoExpandingTextBox,
    'colour-style-selector': ColourStyleSelector,
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
  data(): DataProperties {
    return { editing: false, textData: this.text, style: {} };
  },
  computed: {
    styleObject: function (): {
      left: string;
      top: string;
      '--theme-primary-colour': string;
      '--theme-text-colour': string;
    } {
      return {
        left: `${this.posX}px`,
        top: `${this.posY}px`,
        '--theme-primary-colour':
          this.style.backgroundColour || 'var(--colour-primary-emphasis)',
        '--theme-text-colour':
          this.style.textColour || 'var(--colour-background)',
      };
    },
    elementId: function () {
      return `item-${this.id}`;
    },
  },
  methods: {
    _onDeleteClick: async function (): Promise<void> {
      try {
        await this.$apollo.mutate({
          mutation: DELETE_BOARD_ITEM_MUTATION,
          variables: {
            id: this.id,
          },
        });
      } catch (e) {
        this.$toasted.global.apollo_error(
          `Could not remove item: ${e.message}`
        );
      }
    },
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
        this.$toasted.global.apollo_error(
          `Could not save item changes: ${e.message}`
        );
      }
    },
    _onEditClick: function (): void {
      this.editing = true;
    },
    _onPointerDown: function (event: PointerEvent): void {
      if (this.lockedBy) {
        return;
      }

      if (event.button && event.button !== PRIMARY_MOUSE_BUTTON_ID) {
        return;
      }

      this.$emit('movestart', {
        itemId: this.$props.id,
        pointerId: event.pointerId,
      } as MoveStartEventPayload);
    },
    _onStyleChange: function (style: DataProperties['style']) {
      this.style = style;
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
  border-color: var(--colour-primary-emphasis);
  cursor: none;
}

li[data-editing] {
  display: flex;
  flex-direction: column;
}

li {
  --theme-primary-colour: injected-by-component;
  --theme-text-colour: injected-by-component;

  box-shadow: 2px 2px 4px 0px var(--colour-shadow);
  background: var(--theme-primary-colour);
  color: var(--theme-text-colour);
  position: absolute;
  border: calc(1 * var(--unit-base-rem)) var(--theme-primary-colour) solid;
  min-width: 100px;
  min-height: 120px;
  max-width: 200px;
  height: fit-content;
  display: inline-block;
  cursor: grab;
  user-select: none;
  text-overflow: ellipsis;
  touch-action: none;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: var(--font-size-text);
}

button {
  position: absolute;
  text-align: center;
  width: calc(12px + var(--font-size-icon-button));
  height: calc(12px + var(--font-size-icon-button));
  font-size: var(--font-size-icon-button);
  line-height: var(--font-size-icon-button);
  border: solid 1px;
  padding: 0;
  border-radius: 100%;
  box-shadow: 2px 2px 4px 0px var(--colour-secondary);
}

button#save-button {
  right: calc(-2 * (var(--font-size-icon-button)));
  bottom: 0;
}

button#delete-button {
  right: calc(-2 * (var(--font-size-icon-button)));
  top: 0;
}

button > span {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
}
</style>
