import Vue, { VueConstructor } from 'vue';
import { DocumentNode } from 'graphql';
import { createMockClient } from 'mock-apollo-client';
import VueApollo from 'vue-apollo';
import {ComponentHarness, ConfigurationCallback, render} from '@testing-library/vue';

interface QuerySpec {
  query: DocumentNode;
  successData?: object;
  errorData?: { message: string };
  variables?: object;
}

export interface RenderResult extends ComponentHarness  {
  queryMocks: Array<jest.Mock<any, any>>;
}
const renderWithApollo = <V extends Vue>(
  component: VueConstructor<Vue>,
  querySpec: QuerySpec | QuerySpec[],
  options: { [id: string]: any } = {},
  callback?: ConfigurationCallback<V>

): RenderResult => {
  const mockApolloClient = createMockClient();
  const specs: QuerySpec[] = Array.isArray(querySpec) ? querySpec : [querySpec];

  const queryMocks = specs.map(spec => {
    const queryMock = jest.fn();
    if (spec.variables) {
      queryMock
        .mockResolvedValue({
          data: spec.successData,
          errors: spec.errorData ? [spec.errorData] : undefined,
        });
    } else {
      queryMock.mockResolvedValue({
        data: spec.successData,
        errors: spec.errorData ? [spec.errorData] : undefined,
      });
    }

    mockApolloClient.setRequestHandler(spec.query, queryMock);
    return queryMock;
  });

  const apolloProvider = new VueApollo({
    defaultClient: mockApolloClient,
  });

  const result = render(
    component,
    {
      ...options,
      apolloProvider,
    },
    (vue, store, router) => {
      // @ts-ignore
      vue.use(VueApollo);
      // @ts-ignore
      callback && callback(vue, store, router);
    }
  );

  return {
    ...result,
    queryMocks,
  };
};

export * from '@testing-library/vue';
export { renderWithApollo };
