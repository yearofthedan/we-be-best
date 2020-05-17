import ApolloClient from 'apollo-boost';
import VueApollo from 'vue-apollo';
import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

const apolloClient = new ApolloClient({
  uri: '/graphql',
});

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
});

Vue.use(VueApollo);

new Vue({
  render: h => h(App),
  apolloProvider,
}).$mount('#app');
