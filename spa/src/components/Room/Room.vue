<template>
  <article>
    <template v-if="loading">Loading...</template>
    <template v-else-if="error">An error occurred {{ error }}</template>
    <template v-else-if="room">
      <room-board
        v-bind:zoom-factor="zoomFactor"
        v-bind:my-id="myId"
        v-bind:room-id="roomId"
        v-bind:items="room.items"
      />
      <room-details
        v-bind:items="room.items"
        v-bind:members="room.members"
        v-bind:room-id="roomId"
      />
      <button v-on:click="_onZoomOut" aria-label="zoom in" type="button">
        +
      </button>
      <button v-on:click="_onZoomIn" aria-label="zoom out" type="button">
        -
      </button>
      <button v-on:click="_onAddItem" aria-label="Add" type="button" />
    </template>
  </article>
</template>

<script lang="ts">
import Vue from 'vue';
import { ApolloError } from 'apollo-client';
import makeNewItem, { ItemViewModel } from '@/components/Room/Board/items';
import RoomBoard from '@/components/Room/Board/RoomBoard.vue';
import RoomDetails from '@/components/Room/Details/RoomDetails.vue';
import { removeArrayElement, upsertArrayElement } from '@/common/arrays';

import {
  itemUpdates,
  room,
  roomMemberUpdates,
} from '@/graphql/roomQueries.graphql';

import {
  Query,
  Subscription,
  Room,
  QueryRoomArgs,
  SubscriptionRoomMemberUpdatesArgs,
  SubscriptionItemUpdatesArgs,
  Item,
  AddRoomBoardItemInput,
} from '@type-definitions/graphql';
import { addRoomBoardItem } from '@/graphql/boardQueries.graphql';
import { logError } from '@/common/logger';

interface RoomComponentProps {
  roomId: string;
}

interface RoomComponentData {
  loading?: boolean | null;
  error?: ApolloError | Error | null;
  room?: Room | null;
  zoomFactor: number;
}

const resolveUpdate = (items: ItemViewModel[], update: Item) => {
  if (update.isDeleted) {
    return removeArrayElement(items, (e) => e.id === update.id);
  }

  return upsertArrayElement(items, update, (e) => e.id === update.id);
};

export default Vue.extend({
  name: 'room' as string,
  components: {
    'room-board': RoomBoard,
    'room-details': RoomDetails,
  },
  props: {
    myId: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
  },
  data: function (): RoomComponentData {
    return {
      loading: null,
      error: null,
      room: null,
      zoomFactor: 1,
    };
  },
  apollo: {
    room: {
      query: room,
      variables(): QueryRoomArgs {
        return { id: this.roomId };
      },
      subscribeToMore: [
        {
          document: roomMemberUpdates,
          variables: function (): SubscriptionRoomMemberUpdatesArgs {
            return { id: ((this as unknown) as RoomComponentProps).roomId };
          },
          onError(error: ApolloError) {
            ((this as unknown) as RoomComponentData).error = error;
          },
          updateQuery(
            previousResult: Pick<Query, 'room'>,
            {
              subscriptionData,
            }: {
              subscriptionData: {
                data: Pick<Subscription, 'roomMemberUpdates'>;
              };
            }
          ) {
            return {
              room: {
                ...((this as unknown) as RoomComponentData).room,
                members: subscriptionData.data.roomMemberUpdates.members,
              },
            };
          },
        },
        {
          document: itemUpdates,
          variables: function (): SubscriptionItemUpdatesArgs {
            return { roomId: ((this as unknown) as RoomComponentProps).roomId };
          },
          onError(error: ApolloError) {
            ((this as unknown) as RoomComponentData).error = error;
          },
          updateQuery(
            previousResult: Pick<Query, 'room'>,
            {
              subscriptionData,
            }: { subscriptionData: { data: Pick<Subscription, 'itemUpdates'> } }
          ) {
            const currentRoom = ((this as unknown) as RoomComponentData).room;
            if (!currentRoom?.items) {
              return;
            }

            if (currentRoom.items) {
              return {
                room: {
                  ...currentRoom,
                  items: resolveUpdate(
                    currentRoom.items,
                    subscriptionData.data.itemUpdates
                  ),
                },
              };
            }
          },
        },
      ],
      error(error: ApolloError) {
        this.error = error;
      },
      watchLoading(isLoading: boolean) {
        this.loading = isLoading;
      },
    },
  },
  methods: {
    _onZoomOut: function () {
      this.zoomFactor += 0.2;
    },
    _onZoomIn: function () {
      this.zoomFactor -= 0.2;
    },
    _onAddItem: async function (): Promise<void> {
      const newItem = makeNewItem();
      const mutationPayload: AddRoomBoardItemInput = {
        posY: newItem.posY,
        posX: newItem.posX,
        roomId: this.roomId,
        itemId: newItem.id,
      };
      try {
        await this.$apollo.mutate({
          mutation: addRoomBoardItem,
          variables: {
            input: mutationPayload,
          },
          optimisticResponse: {
            __typename: 'Mutation',
            addRoomBoardItem: {
              __typename: 'Item',
              ...mutationPayload,
              text: '',
              id: null,
              isDeleted: null,
              lockedBy: null,
              style: null,
            },
          },
        });
      } catch (error) {
        logError(error);
        this.$toasted.global.apollo_error(
          `Could not add a new item: ${error.message}`
        );
      }
    },
  },
});
</script>

<style scoped>
section {
  background-color: var(--colour-background);
}

button[aria-label='Zoom Out'] {
  position: absolute;
  left: 0;
  top: 0;
}

button[aria-label='Zoom In'] {
  position: absolute;
  left: 30px;
  top: 0;
}

button[aria-label='Add'] {
  position: fixed;
  z-index: var(--z-index-fab);
  width: calc(16 * var(--unit-base-rem));
  height: calc(16 * var(--unit-base-rem));
  bottom: calc(8 * var(--unit-base-rem));
  right: calc(8 * var(--unit-base-rem));
  font-size: var(--font-size-interactive);
}
button[aria-label='Add']::before {
  content: '➕';
  position: absolute;
  font-size: calc(0.5 * var(--font-size-icon-button));
  top: calc(-0.5 * var(--font-size-icon-button));
  right: calc(-0.5 * var(--font-size-icon-button));
  border-radius: 100%;
  border: 1px solid;
  width: var(--font-size-icon-button);
  height: var(--font-size-icon-button);
  background-color: var(--colour-primary);
  line-height: var(--font-size-icon-button);
}
</style>
