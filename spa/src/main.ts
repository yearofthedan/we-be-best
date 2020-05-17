import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import VueApollo from 'vue-apollo'
import App from './App.vue';

const HOST_NAME = window.location.host;

const httpLink = new HttpLink({
  uri: `https://${HOST_NAME}/graphql`,
})

const wsLink = new WebSocketLink({
  uri: `ws://${HOST_NAME}/graphql`,
  options: {
    reconnect: true,
  },
})
Vue.config.productionTip = false;

const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
  },
  wsLink,
  httpLink
)

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
});

Vue.use(VueApollo);

new Vue({
  render: h => h(App),
  apolloProvider,
}).$mount('#app');
