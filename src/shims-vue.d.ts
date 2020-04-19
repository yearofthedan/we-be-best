declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}

declare module 'vue/types/vue' {
  interface Vue {
    sockets: any;
  }
}

declare module 'vue-native-websocket';
declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    sockets?: any;
  }
}
