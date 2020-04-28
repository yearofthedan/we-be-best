<script lang="ts">
import Vue from "vue";
import JoinRoomForm from "@/components/JoinRoomForm.vue";

export default Vue.extend({
  components: {
    JoinRoomForm
  },
  name: "Lobby",
  data() {
    return { currentRoom: null };
  },
  methods: {
    onJoined: function(room: { id: string }) {
      this.currentRoom = room.id;
    }
  }
});
</script>

<template>
  <article>
    <header>
      <h1>We be best</h1>
    </header>
    <section v-if="currentRoom !== null">
      <p>Gathering</p>
      In room {{ currentRoom }}
    </section>
    <JoinRoomForm v-else v-on:joined="onJoined" />
  </article>
</template>

<style scoped>
h3 {
  margin: 40px 0 0;
}
</style>
