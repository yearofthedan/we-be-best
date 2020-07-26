<template>
  <section>
    <button-action
      @click="$emit('zoom-out', $event)"
      aria-label="zoom out"
      type="button"
    >
      <i class="ri-zoom-out-line"></i>
    </button-action>
    <button-action
      @click="$emit('zoom-in', $event)"
      aria-label="zoom in"
      type="button"
    >
      <i class="ri-zoom-in-line"></i>
    </button-action>
    <button-action @click="onAddNote" aria-label="Add note" type="button"
      ><i class="ri-sticky-note-fill"></i>
    </button-action>
    <label>
      <select
        aria-label="Background"
        v-model="selectedBackground"
        v-on:change="$emit('change-background', $event.target.value)"
      >
        <option disabled value="">Please select one</option>
        <option
          v-bind:selected="option === selectedBackground"
          v-for="option in backgroundOptions"
          :key="option"
          v-bind:value="option"
        >
          <input type="radio" />
          {{ option }}
        </option>
      </select>
    </label>
    <a
      href="placeholder for data download"
      v-bind:download="`we-be-best-room-${roomId}.json`"
      aria-label="download data"
      v-on:click="onExport"
    >
      <i class="ri-file-chart-fill"></i>
    </a>
    <button-action aria-label="copy room link" v-on:click="onShare">
      <i class="ri-links-line"></i>
    </button-action>
  </section>
</template>
<script lang="ts">
import Vue from 'vue';
import ButtonAction from '@/components/atoms/ButtonAction.vue';
import makeNewNote, { NotesViewModel } from '@/components/Room/Board/notes';
import { MemberViewModel } from '@/components/Room/members';
import { mapToJsonString } from '@/components/Room/roomExport';
import { BACKGROUND_OPTIONS } from '@/components/Room/roomStyle';
import {
  AddRoomBoardNoteMutation,
  MutationAddRoomBoardNoteArgs,
} from '@type-definitions/graphql';
import { addRoomBoardNote } from '@/graphql/noteQueries.graphql';

export default Vue.extend({
  name: 'room-controls',
  components: {
    'button-action': ButtonAction,
  },
  props: {
    background: {
      type: String as () => BACKGROUND_OPTIONS,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    notes: {
      type: Object as () => NotesViewModel,
      required: true,
    },
    members: {
      type: Array as () => MemberViewModel[],
      required: true,
    },
  },
  data: function (): {
    backgroundOptions: BACKGROUND_OPTIONS[];
    selectedBackground: string;
    focusedId: string;
  } {
    return {
      backgroundOptions: Object.values(BACKGROUND_OPTIONS),
      selectedBackground: this.background,
      focusedId: 'BLANK',
    };
  },
  methods: {
    onExport: function (event: MouseEvent) {
      const target = event.target as HTMLAnchorElement;
      target.href =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(
          mapToJsonString(this.roomId, this.notes, this.members)
        );
    },
    onShare: function () {
      const path = `${window.location.host}/?room=${this.roomId}`;
      navigator.clipboard.writeText(path);
      this.$toasted.info('link copied', {
        position: 'top-center',
        duration: 600,
        theme: 'outline',
      });
    },
    onAddNote: async function (): Promise<void> {
      const newNote = makeNewNote();
      this.$emit('add-note', newNote);

      try {
        await this.$apollo.mutate<
          AddRoomBoardNoteMutation,
          MutationAddRoomBoardNoteArgs
        >({
          mutation: addRoomBoardNote,
          variables: {
            input: {
              roomId: this.roomId,
              noteId: newNote.id,
            },
          },
        });
      } catch (error) {
        this.$logger.error(error);
        this.$toasted.global.apollo_error(
          `Could not add note: ${error.message}`
        );
      }
    },
  },
});
</script>

<style scoped>
section {
  position: fixed;
  display: grid;
  grid-template-columns: repeat(6, max-content);
  grid-column-gap: calc(2 * var(--unit-base-rem));
  align-items: center;
  padding: calc(2 * var(--unit-base-rem));
  border-radius: 0 0 calc(2 * var(--unit-base-rem))
    calc(2 * var(--unit-base-rem));
  transform: translate(-50%, 0);
  left: 50%;
  top: 0;
  background: var(--colour-primary);
  color: var(--colour-primary-text);
  box-shadow: 1px 1px 2px 0px var(--colour-shadow);
}

i {
  pointer-events: none;
}

label {
  position: relative;
}
</style>
