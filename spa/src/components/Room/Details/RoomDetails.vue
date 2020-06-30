<template>
  <aside>
    <input id="toggle-details" aria-label="room details" type="checkbox" />
    <section>
      <label
        aria-label="room details"
        for="toggle-details"
        v-text="toggleLabel"
      />
      <div></div>
      <button
        v-bind:data-room="roomId"
        aria-label="copy room to clipboard"
        v-on:click="onCopy"
      >
        📄
      </button>
      <hr />
      <span>Members</span>
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
    roomId: {
      type: String,
      required: true,
    },
    members: {
      type: Array as () => { id: string; name: string }[],
      required: true,
    },
  },
  data: function (): { toggleLabel: string } {
    return { toggleLabel: '⚙' };
  },
  methods: {
    onCopy: function () {
      const path = `${window.location.host}/?room=${this.roomId}`;
      navigator.clipboard.writeText(path);
    },
  },
});
</script>

<style scoped>
button::before {
  right: calc(100% + (8 * var(--unit-base-rem)));
  position: absolute;
  content: attr(data-room);
}
button {
  position: relative;
  border-width: 1px;
}
label {
  font-size: calc(8 * var(--unit-base-rem));
  color: var(--colour-primary-emphasis);
  margin-left: auto;
  z-index: 2000;
  position: absolute;
  left: -24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

label::before {
  width: 0;
  height: 0;
  bottom: calc(-3 * var(--unit-base-rem));
  border-top: calc(2 * var(--unit-base-rem)) solid transparent;
  border-bottom: calc(2 * var(--unit-base-rem)) solid transparent;
  border-right: calc(2 * var(--unit-base-rem)) solid
    var(--colour-primary-emphasis);
  position: absolute;
  content: '';
}

aside {
  --content-width: 160px;
  position: fixed;
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
  text-align: right;
  background-color: var(--colour-primary);
  box-shadow: 2px 2px 4px 0px var(--colour-secondary);
  transform: translateX(calc(var(--content-width) - 4px));
  transition-property: transform;
  transition-duration: 0.2s;
  z-index: 1001;
}

aside > section > span {
  padding: calc(2 * var(--unit-base-rem));
  font-size: var(--font-size-label);
}
</style>
