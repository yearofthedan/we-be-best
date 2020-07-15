<template>
  <article>
    <section>
      <form
        id="lobby"
        @submit="onFormSubmit"
        action="https://vuejs.org/"
        method="post"
      >
        <h2>Let's get a room going...</h2>
        <div v-if="errors.length > 0">
          <h3>Please correct the following errors:</h3>
          <ul>
            <li v-for="err in errors" :key="err">{{ err }}</li>
          </ul>
        </div>
        <label for="your-name">
          Your name
          <input id="your-name" type="text" v-model="memberName" />
          <span role="alert" v-if="errors.name">
            {{ this.errors.name }}
          </span>
        </label>
        <label v-if="!isCreating" for="room-id">
          Room id to join
          <button-text type="button" @click="switchToCreate"
            >Create a room
          </button-text>
          <input id="room-id" type="text" v-model="roomId" />
          <span role="alert" v-if="errors.roomId">
            {{ this.errors.roomId }}
          </span>
        </label>
        <dl v-if="isCreating">
          <dt>Create a room with id</dt>
          <button-text
            aria-label="join a room"
            type="button"
            @click="switchToJoin"
            >or join one...
          </button-text>
          <dd>{{ this.roomId }}</dd>
        </dl>
        <button-contained
          :aria-label="isCreating ? 'create room' : 'join room'"
          type="submit"
          :state="submitState"
          >{{ isCreating ? 'create room' : 'join room' }}
        </button-contained>
      </form>
    </section>
  </article>
</template>

<script lang="ts">
import Vue from 'vue';
import { JoinRoomInput } from '@type-definitions/graphql';
import { joinRoom } from '@/graphql/roomQueries.graphql';
import ButtonContained from '@/components/atoms/ButtonContained.vue';
import { ACTION_STATE } from '@/components/atoms/buttonStates';
import ButtonText from '@/components/atoms/ButtonText.vue';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12);

export default Vue.extend({
  name: 'lobby',
  components: {
    'button-contained': ButtonContained,
    'button-text': ButtonText,
  },
  props: {
    existingRoomId: {
      type: String,
      required: false,
    },
  },
  data(): {
    errors: { name?: string; roomId?: string };
    memberName: string | null;
    roomId: string | null;
    submitState: ACTION_STATE;
    isCreating: boolean;
  } {
    return {
      errors: {},
      memberName: null,
      roomId: this.existingRoomId || nanoid(),
      submitState: ACTION_STATE.READY,
      isCreating: !this.existingRoomId,
    };
  },
  methods: {
    switchToJoin() {
      this.isCreating = false;
      this.roomId = '';
    },
    switchToCreate() {
      this.isCreating = true;
      this.roomId = nanoid();
    },
    async onFormSubmit(e: Event) {
      this.submitState = ACTION_STATE.READY;
      this.errors = {};
      e.preventDefault();
      if (!this.memberName) {
        this.errors.name = 'you need a name!';
      }

      if (!this.roomId) {
        this.errors.roomId = 'you need a room!';
      }

      if (Object.keys(this.errors).length > 0) {
        return false;
      }

      this.submitState = ACTION_STATE.LOADING;

      const mutationPayload: { input: JoinRoomInput } = {
        input: {
          roomId: this.roomId as string,
          memberName: this.memberName as string,
        },
      };
      try {
        await this.$apollo.mutate({
          mutation: joinRoom,
          variables: mutationPayload,
        });

        this.submitState = ACTION_STATE.SUCCESS;

        this.$emit('joined', {
          roomId: this.roomId,
          memberName: this.memberName,
        });
      } catch (error) {
        this.submitState = ACTION_STATE.ERROR;
        this.$toasted?.global?.apollo_error(
          `Was not able to join the room: ${error.message}`
        );
      }
    },
  },
});
</script>

<style scoped>
form {
  background-color: var(--colour-background);
  border-radius: calc(1 * var(--unit-base-rem));
  display: grid;
  grid-template-rows: auto;
  grid-row-gap: calc(4 * var(--unit-base-rem));
  justify-content: center;
  min-width: 300px;
  padding: calc(16 * var(--unit-base-rem)) calc(8 * var(--unit-base-rem));
}

span[role='alert'] {
  display: block;
  color: var(--colour-warning);
  text-transform: uppercase;
  text-align: right;
  font-size: var(--font-size-aside);
  font-weight: bold;
}

section {
  height: 100%;
  display: grid;
  align-content: center;
  justify-content: center;
}

label[for='room-id'] {
  font-size: var(--font-size-label);
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'a b'
    'c c'
    'd d';
  align-items: flex-end;
}

label[for='room-id'] > button {
  margin-bottom: var(--unit-base-rem);
  grid-area: b;
}

label[for='room-id'] > input {
  grid-area: c;
}

label[for='room-id'] > [role='alert'] {
  grid-area: d;
}

input {
  display: block;
  font-size: var(--font-size-interactive);
  padding: calc(2 * var(--unit-base-rem));
  min-width: 300px;
}

dl {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'a b'
    'c b';
  align-items: flex-end;
}

dl > button {
  margin-bottom: var(--unit-base-rem);
  grid-area: b;
}

dl > dd {
  grid-area: c;
  color: var(--colour-secondary);
}

article {
  background: linear-gradient(124deg, transparent 56%, var(--light-pink) 56%),
    linear-gradient(64deg, transparent 60%, var(--whitest-white) 60%),
    linear-gradient(36deg, var(--light-orange) 46%, var(--light-cyan) 46%);
}
</style>
