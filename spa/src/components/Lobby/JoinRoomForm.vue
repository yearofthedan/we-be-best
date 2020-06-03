<script lang="ts">
import Vue from 'vue';
import {
  JOIN_ROOM_MUTATION,
  JoinRoomInput,
} from '@/components/Room/roomGraphQLQuery';

export default Vue.extend({
  name: 'join-room-form',
  data(): {
    errors: { name?: string; roomName?: string };
    memberName: string | null;
    roomName: string | null;
  } {
    return {
      errors: {},
      memberName: null,
      roomName: null,
    };
  },
  methods: {
    async onFormSubmit(e: Event) {
      this.errors = {};
      e.preventDefault();

      if (!this.memberName) {
        this.errors.name = 'you need a name!';
      }

      if (!this.roomName) {
        this.errors.roomName = 'you need a room!';
      }

      if (Object.keys(this.errors).length > 0) {
        return false;
      }

      const mutationPayload: { input: JoinRoomInput } = {
        input: {
          roomName: this.roomName as string,
          memberName: this.memberName as string,
        },
      };
      try {
        await this.$apollo.mutate({
          mutation: JOIN_ROOM_MUTATION,
          variables: mutationPayload,
        });

        this.$emit('joined', {
          roomName: this.roomName,
          memberName: this.memberName,
        });
      } catch (error) {
        console.error(error);
      }
    },
  },
});
</script>

<template>
  <section>
    <form
      id="join-room-form"
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
      <label for="room-name">
        Room name
        <input id="room-name" type="text" v-model="roomName" />
        <span role="alert" v-if="errors.roomName">
          {{ this.errors.roomName }}
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
