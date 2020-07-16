import { VueConstructor } from 'vue';

const logInfo = (message: string): void => console.info(message);
const logError = (message: string): void => console.error(message);

const install = function (Vue: VueConstructor): void {
  Vue.prototype.$logger = {
    info: logInfo,
    error: logError,
  };
};

declare module 'vue/types/vue' {
  interface Vue {
    $logger: {
      [key in 'info' | 'error']: (message: string) => void;
    };
  }
}

export default { install };
