import Vue from 'vue';
import Toasted from 'vue-toasted';

export default (): void => {
  Vue.use(Toasted);

  Vue.toasted.register(
    'apollo_error',
    (message) => {
      return message;
    },
    {
      position: 'bottom-center',
      duration: 5000,
      fullWidth: true,
      type: 'error',
      theme: 'outline',
      singleton: true,
    }
  );
};
