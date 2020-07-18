import Vue, { VueConstructor } from 'vue';

const install = function (Vue: VueConstructor): void {
  Vue.prototype.$logger = {
    error: (message: string): void => console.error(message),
  };
};

declare module 'vue/types/vue' {
  interface Vue {
    $logger: {
      [key in 'error']: (message: string) => void;
    };
  }
}

export default (): void => {
  Vue.use({ install });
};
