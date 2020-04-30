<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "join-room-form",
  data(): { errors: string[], name: string | null } {
    return {
      errors: [],
      name: null,
    }
  },
  methods: {
    onFormSubmit(e: Event) {
      this.errors = [];
      e.preventDefault();

      if (!this.name) {
        this.errors.push('you need to add a name');
        return false;
      }

      this.$emit("joined", {
        id: "placeholder-id"
      });
    }
  }
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
      <p v-if="errors.length > 0">
        <h3>Please correct the following errors:</h3>
        <ul>
          <li v-for="err in errors" :key="err" >{{err}}</li>
        </ul>
      </p>
      <label for="your-name">
        Your name
      </label>
      <input id="your-name" type="text" v-model="name" />
      <button type="submit">New gathering</button>
    </form>
  </section>
</template>

<style scoped></style>
