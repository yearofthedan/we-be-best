<script lang="ts">
import Vue from 'vue';
import { JoinRoomInput } from '@type-definitions/graphql';
import { joinRoom } from '@/graphql/roomQueries.graphql';
import { v4 } from 'uuid';

export default Vue.extend({
  name: 'lobby',
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
  } {
    return {
      errors: {},
      memberName: null,
      roomId: this.existingRoomId || v4(),
    };
  },
  methods: {
    async onFormSubmit(e: Event) {
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

        this.$emit('joined', {
          roomId: this.roomId,
          memberName: this.memberName,
        });
      } catch (error) {
        this.$toasted?.global?.apollo_error(
          `Was not able to join the room: ${error.message}`
        );
      }
    },
  },
});
</script>

<template>
  <section>
    <form
      id="lobby"
      @submit="onFormSubmit"
      action="https://vuejs.org/"
      method="post"
    >
      <h2>Join others</h2>
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
      <label for="room-id">
        Room id
        <input id="room-id" type="text" v-model="roomId" />
        <span role="alert" v-if="errors.roomId">
          {{ this.errors.roomId }}
        </span>
      </label>
      <button type="submit">join room</button>
    </form>
  </section>
</template>

<style scoped>
form {
  justify-content: center;
  display: grid;
  grid-template-rows: auto;
  grid-row-gap: calc(4 * var(--unit-base-rem));
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
  display: flex;
  justify-content: center;
  align-items: baseline;
}
label {
  font-size: var(--font-size-label);
  max-width: 100%;
}
input {
  display: block;
  font-size: var(--font-size-interactive);
  padding: calc(2 * var(--unit-base-rem));
  max-width: 100%;
}
form {
  width: calc(16 * var(--unit-base-rem));
  padding-top: calc(8 * var(--unit-base-rem));
}
button {
  max-width: 100%;
  margin: calc(2 * var(--unit-base-rem));
  padding: calc(2 * var(--unit-base-rem));
  border-radius: calc(1 * var(--unit-base-rem));
  font-size: var(--font-size-interactive);
  text-transform: uppercase;
}
</style>
