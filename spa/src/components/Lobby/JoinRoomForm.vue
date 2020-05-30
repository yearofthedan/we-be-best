<script lang="ts">
import Vue from 'vue';
import {
  JOIN_ROOM_MUTATION,
  JoinRoomInput,
} from '@/components/Room/roomGraphQLQuery';

export default Vue.extend({
  name: 'join-room-form',
  data(): {
    errors: string[];
    memberName: string | null;
    roomName: string | null;
  } {
    return {
      errors: [],
      memberName: null,
      roomName: null,
    };
  },
  methods: {
    async onFormSubmit(e: Event) {
      this.errors = [];
      e.preventDefault();

      if (!this.memberName) {
        this.errors.push('you need to add a name');
      }

      if (!this.roomName) {
        this.errors.push('you need to enter a room name');
      }

      if (this.errors.length > 0) {
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
      <div v-if="errors.length > 0">
        <h3>Please correct the following errors:</h3>
        <ul>
          <li v-for="err in errors" :key="err">{{ err }}</li>
        </ul>
      </div>
      <label for="your-name">
        Your name
        <input id="your-name" type="text" v-model="memberName" />
      </label>
      <label for="room-name">
        Room name
        <input id="room-name" type="text" v-model="roomName" />
      </label>
      <button type="submit">That's me</button>
    </form>
  </section>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
label {
  display: block;
}
input {
  display: block;
}
button {
  margin-top: 12px;
}
</style>
