<template>
  <aside>
    <label aria-label="room details" for="toggle-details">👤</label>
    <input id="toggle-details" aria-label="room details" type="checkbox" />
    <section>
      <room-members v-bind:members="members" />
    </section>
  </aside>
</template>

<script lang="ts">
import Vue from 'vue';
import RoomMembers from '@/components/Room/Details/RoomMembers.vue';

export default Vue.extend({
  name: 'room-details',
  components: {
    'room-members': RoomMembers,
  },
  props: {
    members: {
      type: Array,
      required: true,
    },
  },
});
</script>

<style scoped>
label {
  font-size: calc(6 * var(--unit-base-rem));
  height: 40px;
  width: 40px;
  margin-left: auto;
  z-index: 2000;
}

aside {
  position: absolute;
  top: 0;
  right: 20px;
  width: 160px;
  display: grid;
  z-index: 1000;
}

aside > input {
  opacity: 0;
  height: 0;
  width: 0;
}

aside > input:checked ~ section {
  transform: translateX(0);
  opacity: 1;
}

aside > section {
  transform: translateX(200px);
  transition-property: transform, opacity;
  transition-duration: 0.2s;
  opacity: 0;
  z-index: 1001;
}
</style>
