<template>
  <aside>
    <input id="toggle-details" aria-label="room details" type="checkbox" />
    <section>
      <label
        aria-label="room details"
        for="toggle-details"
        v-text="toggleLabel"
      />
      <dl>
        <dt>Room id</dt>
        <dd>
          {{ roomId }}
          <button-text aria-label="copy room link" v-on:click="onCopy">
            📄 Copy room link
          </button-text>
        </dd>
        <hr />
        <dt>
          Members
        </dt>
        <dd><room-members v-bind:members="members" /></dd>
      </dl>
      <hr />
      <dt>Background</dt>
      <dd>
        <button>1</button>
        <button>2</button>
      </dd>
      <hr />
      <button-text aria-label="download data" v-on:click="onDownload">
        ⬇️ Download data
      </button-text>
      <a ref="dataDownload" />
    </section>
  </aside>
</template>

<script lang="ts">
import Vue from 'vue';
import RoomMembers from '@/components/Room/Details/RoomMembers.vue';
import ButtonText from '@/components/atoms/ButtonText.vue';
import { ItemViewModel } from '@/components/Room/Board/items';
import { mapToJsonString } from '@/components/Room/Details/roomExport';

export default Vue.extend({
  name: 'room-details',
  components: {
    'room-members': RoomMembers,
    'button-text': ButtonText,
  },
  props: {
    roomId: {
      type: String,
      required: true,
    },
    items: {
      type: Array as () => ItemViewModel[],
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
    onDownload: function () {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(
          mapToJsonString(this.roomId, this.items, this.members)
        );

      const dataDownload = this.$refs.dataDownload as HTMLAnchorElement;
      dataDownload.setAttribute('href', dataStr);
      dataDownload.setAttribute('download', `room-${this.roomId}.json`);
      dataDownload.click();
    },
  },
});
</script>

<style scoped>
label {
  --label-left-offset: -24px;
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
