<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "joined-room",
  props: {
    roomId: {
      type: String,
      required: true
    }
  }
});
</script>

<template>
  <section>
    <h1>Room for {{roomId}}</h1>
  </section>
</template>
