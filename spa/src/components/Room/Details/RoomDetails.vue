<template>
  <aside>
    <input id="toggle-details" aria-label="room details" type="checkbox" />
    <section>
      <label aria-label="room details" for="toggle-details" />
      <dl>
        <dt>Room id</dt>
        <dd>
          {{ roomId }}
        </dd>
        <hr />
        <dt>
          Members
        </dt>
        <dd><room-members v-bind:members="members" /></dd>
      </dl>
    </section>
  </aside>
</template>

<script lang="ts">
import Vue from 'vue';
import RoomMembers from '@/components/Room/Details/RoomMembers.vue';
import { MemberViewModel } from '@/components/Room/members';

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
      type: Array as () => MemberViewModel[],
      required: true,
    },
  },
  data: function (): { toggleLabel: string } {
    return { toggleLabel: '⚙' };
  },
});
</script>

<style scoped>
label {
  --label-left-offset: -16px;
  font-size: calc(8 * var(--unit-base-rem));
  color: var(--colour-primary-emphasis);
  margin-left: auto;
  z-index: 2000;
  position: absolute;
  left: var(--label-left-offset);
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
  --content-width: 180px;
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
  box-shadow: 2px 2px 4px 0 var(--colour-secondary);
  padding: calc(2 * var(--unit-base-rem)) 0;
  transform: translateX(calc(var(--content-width) - 4px));
  transition-property: transform;
  transition-duration: 0.2s;
  clip-path: inset(0px var(--content-width) 0px var(--label-left-offset));
  z-index: 1001;
}

dl > dt {
  padding: calc(2 * var(--unit-base-rem));
  font-size: var(--font-size-label);
  text-align: right;
}

dl > dd {
  font-size: var(--font-size-aside);
  margin-right: calc(2 * var(--unit-base-rem));
}

button[aria-label='download data'] {
  margin-right: calc(2 * var(--unit-base-rem));
}
</style>
