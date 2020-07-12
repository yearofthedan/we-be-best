<template>
  <li
    v-bind:style="styleObject"
    v-bind:id="elementId"
    v-on:mousedown="_onMouseDown"
    v-on:pointerdown="_onPointerDown"
    v-on:dblclick="_onEditClick"
    v-bind:data-moving="moving"
    v-bind:data-editing="editing"
    v-bind:data-locked-by="!lockedByMe && item.lockedBy"
  >
    <template v-if="editing">
      <colour-style-selector
        v-bind:options="styleOptions"
        v-on:input="_onStyleChange"
      />
      <auto-expanding-text-box v-model="text" ref="textbox" />
      <div id="action-button-group">
        <button-action aria-label="delete" v-on:click="_onDeleteClick"
          ><i class="ri-delete-bin-4-line"></i
        ></button-action>
        <button-action aria-label="save" v-on:click="_onSaveClick"
          ><i class="ri-check-fill"></i>
        </button-action>
      </div>
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
  DeleteBoardItemMutation,
  MutationDeleteBoardItemArgs,
  MutationUpdateBoardItemStyleArgs,
  MutationUpdateBoardItemTextArgs,
  UpdateBoardItemStyleMutation,
  UpdateBoardItemTextMutation,
} from '@type-definitions/graphql';
import { itemTheme } from './itemTheme';
import { ItemViewModel } from '@/components/Room/Board/items';
import { logError } from '@/common/logger';
import ButtonAction from '@/components/atoms/ButtonAction.vue';

interface MoveStartEventPayload {
  itemId: string;
  pointerId: number;
}

type DataProperties = {
  text: string;
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
    'button-action': ButtonAction,
  },
  props: {
    item: {
      type: Object as () => ItemViewModel,
      required: true,
    },
    editing: {
      type: Boolean,
      required: false,
    },
    moving: {
      type: Boolean,
      required: false,
    },
    myId: {
      type: String,
      required: true,
    },
  },
  data(): DataProperties {
    return {
      text: this.item.text,
      selectedStyle: this.item.style || 0,
      styleOptions: itemTheme,
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
    lockedByMe: function () {
      return this.item.lockedBy === this.myId;
    },
  },
  methods: {
    _onDeleteClick: async function (): Promise<void> {
      try {
        this.$emit('editfinish');
        await this.$apollo.mutate<
          DeleteBoardItemMutation,
          MutationDeleteBoardItemArgs
        >({
          mutation: deleteBoardItem,
          variables: {
            id: this.item.id,
          },
        });
      } catch (e) {
        logError(e);
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
        this.$emit('editfinish');
        await this.$apollo.mutate<
          UpdateBoardItemTextMutation,
          MutationUpdateBoardItemTextArgs
        >({
          mutation: updateBoardItemText,
          variables: {
            input: mutationPayload,
          },
          optimisticResponse: {
            __typename: 'Mutation',
            updateBoardItemText: {
              __typename: 'Item',
              ...this.item,
            },
          },
        });
      } catch (e) {
        logError(e);
        this.$toasted.global.apollo_error(
          `Could not save item changes: ${e.message}`
        );
      }
    },
    _onEditClick: function (): void {
      this.$emit('editstart', this.item.id);
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

      ((this.$refs.textbox as Vue).$el as HTMLElement).focus();

      try {
        await this.$apollo.mutate<
          UpdateBoardItemStyleMutation,
          MutationUpdateBoardItemStyleArgs
        >({
          mutation: updateBoardItemStyle,
          variables: {
            input: {
              id: this.item.id,
              style: this.selectedStyle,
            },
          },
        });
      } catch (e) {
        logError(e);
        this.$toasted.global.apollo_error(
          `Could not save item style changes: ${e.message}`
        );
      }
    },
  },
});
</script>

<style scoped>
li[data-locked-by]::before {
  max-width: fit-content;
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  content: '🔒' attr(data-locked-by);
  border-radius: 4px;
  padding: var(--unit-base-rem);
  font-size: var(--font-size-aside);
  border: solid 1px var(--colour-primary-emphasis);
  background-color: var(--colour-primary);
}

li[data-locked-by] {
  background-color: var(--colour-secondary);
  border-color: var(--colour-secondary);
}

li[data-moving] {
  border-color: var(--colour-primary-emphasis);
  background-color: var(--colour-secondary);
  cursor: none;
  z-index: var(--z-index-board-item-moving);
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
  z-index: var(--z-index-board-item);
}

#action-button-group {
  position: absolute;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 100%;
  right: calc(-1.5 * (var(--font-size-button)));
  width: var(--font-size-button);
  bottom: 0;
  color: var(--colour-background);
}

#action-button-group > button {
  background-color: var(--colour-secondary);
}
</style>
