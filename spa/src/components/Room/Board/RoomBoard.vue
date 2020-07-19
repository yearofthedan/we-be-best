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
    <room-board-note
      v-for="note in notesData"
      v-bind:note="note"
      v-bind:moving="_getIsMoving(note.id)"
      v-bind:my-id="myId"
      v-bind:editing="editingNoteReference === note.id"
      v-on:pointerheld="_onBoardNotePointerHeld"
      v-on:editstart="_onBoardNoteEditStart"
      v-on:editfinish="_onBoardNoteEditFinish"
      :key="note.id"
    />
  </transition-group>
</template>

<script lang="ts">
import Vue from 'vue';
import RoomBoardNote from './RoomBoardNote.vue';
import {
  lockRoomBoardNote,
  moveBoardNote,
  unlockRoomBoardNote,
} from '@/graphql/boardQueries.graphql';
import { NoteViewModel } from '@/components/Room/Board/notes';
import { patchArrayElement } from '@/common/arrays';
import { supportsTouchEvents } from '@/common/dom';
import {
  LockRoomBoardNoteInput,
  MoveBoardNoteInput,
  UnlockRoomBoardNoteInput,
} from '@type-definitions/graphql';

export default Vue.extend({
  name: 'board',
  components: {
    'room-board-note': RoomBoardNote,
  },
  props: {
    background: {
      type: String,
      default: 'QUADRANTS',
    },
    notes: {
      type: Array as () => NoteViewModel[],
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
    notes: function (newVal) {
      this.notesData = newVal;
    },
  },
  data: function (): {
    notesData: NoteViewModel[];
    movingNoteReference: string | null;
    editingNoteReference: string | null;
    heldNoteReference: string | null;
    primaryTouchId: string | null;
  } {
    return {
      notesData: this.notes,
      movingNoteReference: null,
      editingNoteReference: null,
      heldNoteReference: null,
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
    _getIsMoving: function (noteId: string): boolean {
      return noteId === this.movingNoteReference;
    },
    _onPointerUp: function (): void {
      this._onBoardNoteStoppedMoving();
      this.heldNoteReference = null;
    },
    _onPointerMove: function (event: PointerEvent): void {
      if (!supportsTouchEvents()) {
        return;
      }
      const { movementX, movementY } = event;

      this.moveNoteIfHeld(movementX, movementY);
    },
    _onMouseMove: function (event: MouseEvent): void {
      if (supportsTouchEvents()) {
        return;
      }
      const { movementX, movementY } = event;
      this.moveNoteIfHeld(movementX, movementY);
    },
    moveNoteIfHeld(movementX: number, movementY: number) {
      if (!this.movingNoteReference) {
        if (!this.heldNoteReference) {
          return;
        }
        this.movingNoteReference = this.heldNoteReference;
        this._lockNote(this.heldNoteReference);
      }

      this._onBoardNoteMoved({
        noteReference: this.movingNoteReference,
        movementX,
        movementY,
      });
    },
    _lockNote: function (noteId: string): void {
      const mutationPayload: LockRoomBoardNoteInput = {
        id: noteId,
        lockedBy: this.myId,
      };
      this.$apollo
        .mutate({
          mutation: lockRoomBoardNote,
          variables: {
            input: mutationPayload,
          },
        })
        .catch((error) => {
          this.$logger.error(error);
          this.$toasted.global.apollo_error(
            `Could not move the note: ${error.message}`
          );
        });
    },
    _onBoardNotePointerHeld: function (payload: NotePointerEventPayload) {
      this.heldNoteReference = payload.noteId;
    },
    _onBoardNoteEditStart: function (noteId: string) {
      if (this.editingNoteReference) {
        return;
      }
      this.editingNoteReference = noteId;
    },
    _onBoardNoteEditFinish: function () {
      this.editingNoteReference = null;
    },
    _onBoardNoteMoved: function ({
      noteReference,
      movementX,
      movementY,
    }: NoteMovedEventPayload) {
      const note = this.notesData.find((e) => e.id === noteReference);
      if (!note) {
        return;
      }
      const { posX, posY } = note;

      this.notesData = patchArrayElement(
        this.notesData,
        {
          posX: Math.max(0, posX + movementX),
          posY: Math.max(0, posY + movementY),
          lockedBy: this.myId,
        },
        (e) => e.id === noteReference
      );
    },
    _onBoardNoteStoppedMoving: async function (): Promise<void> {
      const noteRef = this.movingNoteReference;
      if (!noteRef) {
        return;
      }

      const note = this.notesData.find((i) => i.id === noteRef);
      if (!note) {
        return;
      }

      this.movingNoteReference = null;

      const updateRoomBoardNotesPayload: MoveBoardNoteInput = {
        id: note.id,
        posX: note.posX,
        posY: note.posY,
      };

      await this.$apollo
        .mutate({
          mutation: moveBoardNote,
          variables: {
            input: updateRoomBoardNotesPayload,
          },
        })
        .catch((error) => {
          this.$toasted.global.apollo_error(
            `Could not update the note: ${error.message}`
          );
        });

      const mutationPayload: UnlockRoomBoardNoteInput = {
        id: note.id,
      };
      await this.$apollo
        .mutate({
          mutation: unlockRoomBoardNote,
          variables: {
            input: mutationPayload,
          },
        })
        .catch((error) => {
          this.$toasted?.global?.apollo_error(
            `Could not update the note: ${error.message}`
          );
        });
    },
  },
});

interface NotePointerEventPayload {
  noteId: string;
  pointerId: number;
}

interface NoteMovedEventPayload {
  noteReference: string;
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
