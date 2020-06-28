<template>
  <aside>
    <input id="toggle-details" aria-label="room details" type="checkbox" />
    <section>
      <label aria-label="room details" for="toggle-details">
        👤
      </label>
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
      type: Array as () => { id: string; name: string }[],
      required: true,
    },
  },
});
</script>

<style scoped>
label {
  font-size: calc(6 * var(--unit-base-rem));
  margin-left: auto;
  z-index: 2000;
  position: absolute;
  left: -28px;
  display: flex;
  justify-content: center;
  align-items: center;
}

label::before {
  width: 0;
  height: 0;
  left: calc(-2 * var(--unit-base-rem));
  border-top: calc(2 * var(--unit-base-rem)) solid transparent;
  border-bottom: calc(2 * var(--unit-base-rem)) solid transparent;
  border-right: calc(2 * var(--unit-base-rem)) solid
    var(--colour-primary-emphasis);
  position: absolute;
  content: '';
}

aside {
  --content-width: 160px;
  position: absolute;
  top: 0;
  right: 0;
  width: var(--content-width);
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
}

aside > section {
  transform: translateX(calc(var(--content-width) - 4px));
  transition-property: transform;
  transition-duration: 0.2s;
  z-index: 1001;
}
</style>
