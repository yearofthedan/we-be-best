import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import VueApollo, { ApolloProvider } from 'vue-apollo';
import Vue from 'vue';

const GRAPHQL_URI_HTTP =
  process.env.VUE_APP_GRAPHQL_URI_HTTP ??
  `https://${window.location.host}/graphql`;
const GRAPHQL_URI_WS =
  process.env.VUE_APP_GRAPHQL_URI_WS ?? `wss://${window.location.host}/graphql`;

export default (): ApolloProvider => {
  Vue.use(VueApollo);

  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    new WebSocketLink({
      uri: GRAPHQL_URI_WS,
      options: {
        reconnect: true,
      },
    }),
    new HttpLink({ uri: GRAPHQL_URI_HTTP })
  );

  const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });

  return new VueApollo({
    defaultClient: apolloClient,
  });
};
