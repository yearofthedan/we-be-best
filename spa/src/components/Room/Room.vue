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
        v-bind:background="background"
      />
      <room-details
        v-bind:items="room.items"
        v-bind:members="room.members"
        v-bind:room-id="roomId"
      />
      <room-board-controls
        v-on:zoom-in="_onZoomIn"
        v-on:zoom-out="_onZoomOut"
        v-on:add-item="_onAddItem"
        v-on:export="_onExport"
        v-on:change-background="_onChangeBackground"
        v-bind:background="background"
      />
      <a ref="dataDownload" />
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
import RoomBoardControls from '@/components/Room/Board/RoomBoardControls.vue';
import { mapToJsonString } from '@/components/Room/Details/roomExport';
import { MembersViewModel } from '@/components/Room/Details/members';

interface RoomComponentProps {
  roomId: string;
}

interface RoomComponentData {
  loading?: boolean | null;
  error?: ApolloError | Error | null;
  room?: Room | null;
  zoomFactor: number;
  background: string;
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
    'room-board-controls': RoomBoardControls,
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
      background: 'QUADRANTS',
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
    _onChangeBackground: function (type: string) {
      this.background = type;
    },
    _onZoomOut: function () {
      this.zoomFactor -= 0.2;
    },
    _onZoomIn: function () {
      this.zoomFactor += 0.2;
    },
    _onExport: function () {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(
          mapToJsonString(
            this.roomId,
            this.room?.items as ItemViewModel[],
            this.room?.members as MembersViewModel[]
          )
        );

      const dataDownload = this.$refs.dataDownload as HTMLAnchorElement;
      dataDownload.setAttribute('href', dataStr);
      dataDownload.setAttribute('download', `room-${this.roomId}.json`);
      dataDownload.click();
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
article {
  background-color: var(--colour-secondary);
}
</style>
