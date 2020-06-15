import Vue from 'vue';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import VueApollo from 'vue-apollo';
import App from './components/App.vue';

const GRAPHQL_URI_HTTP =
  process.env.VUE_APP_GRAPHQL_URI_HTTP ||
  `https://${window.location.host}/graphql`;
const GRAPHQL_URI_WS =
  process.env.VUE_APP_GRAPHQL_URI_WS || `wss://${window.location.host}/graphql`;

const httpLink = new HttpLink({
  uri: GRAPHQL_URI_HTTP,
});

const wsLink = new WebSocketLink({
  uri: GRAPHQL_URI_WS,
  options: {
    reconnect: true,
  },
});
Vue.config.productionTip = false;

const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
});

Vue.use(VueApollo);

new Vue({
  render: (h) => h(App),
  apolloProvider,
}).$mount('#app');
