import Vue from 'vue';
import App from './components/App.vue';
import registerRouter from '@/vue/router';
import registerApollo from '@/vue/apollo';
import registerLogging from '@/vue/logger';
import registerToasts from '@/vue/toasts';
import { routes } from '@/components/routes';

Vue.config.productionTip = false;

const apolloProvider = registerApollo();
const router = registerRouter(routes);
registerToasts();
registerLogging();

new Vue({
  render: (h) => h(App),
  router,
  apolloProvider,
}).$mount('#app');
