<template>
  <li
    v-bind:style="styleObject"
    v-bind:id="elementId"
    v-on:mousedown="_onMouseDown"
    v-on:pointerdown="_onPointerDown"
    v-on:dblclick="_onEditClick"
    v-bind:data-moving="moving"
    v-bind:data-editing="editing"
    v-bind:data-locked-by="item.lockedBy"
  >
    <template v-if="editing">
      <colour-style-selector
        v-bind:options="styleOptions"
        v-on:input="_onStyleChange"
      />
      <auto-expanding-text-box v-model="text" />
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
  deleteBoardItem,
  updateBoardItemStyle,
  updateBoardItemText,
} from '@/graphql/boardQueries.graphql';
import AutoExpandingTextBox from '@/components/Room/Board/AutoExpandingTextBox.vue';
import { PRIMARY_MOUSE_BUTTON_ID, supportsTouchEvents } from '@/common/dom';
import ColourStyleSelector from '@/components/Room/Board/ColourStyleSelector.vue';
import {
  Item,
  MutationDeleteBoardItemArgs,
  MutationUpdateBoardItemStyleArgs,
  MutationUpdateBoardItemTextArgs,
} from '@type-definitions/graphql';
import { itemTheme } from './itemTheme';

interface MoveStartEventPayload {
  itemId: string;
  pointerId: number;
}

type DataProperties = {
  editing: boolean;
  text: string;
  lockedByMe: boolean;
  selectedStyle: number;
  styleOptions: {
    name: string;
    backgroundColour: string;
    textColour: string;
  }[];
};

export default Vue.extend({
  name: 'room-board-item',
  components: {
    'auto-expanding-text-box': AutoExpandingTextBox,
    'colour-style-selector': ColourStyleSelector,
  },
  props: {
    item: {
      type: Object as () => Item,
      required: true,
    },
    moving: {
      type: Boolean,
    },
    myId: {
      type: String,
      required: true,
    },
  },
  data(): DataProperties {
    return {
      editing: false,
      text: this.item.text,
      selectedStyle: this.item.style || 0,
      styleOptions: itemTheme,
      lockedByMe: this.item.lockedBy === this.myId,
    };
  },
  computed: {
    styleObject: function (): {
      left: string;
      top: string;
      '--theme-primary-colour': string;
      '--theme-text-colour': string;
    } {
      const style = this.styleOptions[this.selectedStyle];
      return {
        left: `${this.item.posX}px`,
        top: `${this.item.posY}px`,
        '--theme-primary-colour':
          style.backgroundColour || 'var(--colour-primary-emphasis)',
        '--theme-text-colour': style.textColour || 'var(--colour-background)',
      };
    },
    elementId: function () {
      return `item-${this.item.id}`;
    },
  },
  methods: {
    _onDeleteClick: async function (): Promise<void> {
      try {
        await this.$apollo.mutate<Item, MutationDeleteBoardItemArgs>({
          mutation: deleteBoardItem,
          variables: {
            id: this.item.id,
          },
        });
      } catch (e) {
        this.$toasted.global.apollo_error(
          `Could not remove item: ${e.message}`
        );
      }
    },
    _onSaveClick: async function (): Promise<void> {
      const mutationPayload = {
        id: this.item.id,
        text: this.text,
      };

      try {
        await this.$apollo.mutate<Item, MutationUpdateBoardItemTextArgs>({
          mutation: updateBoardItemText,
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
      if (!supportsTouchEvents()) {
        // this is a hack because safari has experimental implementation of pointer events but not touch so I want it to use mouse events in Safari
        return;
      }
      this._onMove(event);
    },
    _onMouseDown: function (event: MouseEvent): void {
      if (supportsTouchEvents()) {
        return;
      }
      this._onMove(event);
    },
    _onMove: function (event: MouseEvent): void {
      if (
        (this.item.lockedBy && !this.lockedByMe) ||
        (event.button && event.button !== PRIMARY_MOUSE_BUTTON_ID)
      ) {
        return;
      }

      this.$emit('movestart', {
        itemId: this.item.id,
        pointerId: 1,
      } as MoveStartEventPayload);
    },
    _onStyleChange: async function (style: string) {
      this.selectedStyle = this.styleOptions.findIndex((s) => s.name === style);
      try {
        await this.$apollo.mutate<Item, MutationUpdateBoardItemStyleArgs>({
          mutation: updateBoardItemStyle,
          variables: {
            input: {
              id: this.item.id,
              style: this.selectedStyle,
            },
          },
        });
      } catch (e) {
        this.$toasted.global.apollo_error(
          `Could not save item changes: ${e.message}`
        );
      }
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
