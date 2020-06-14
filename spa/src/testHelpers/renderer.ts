import { VueConstructor } from 'vue';
import { DocumentNode } from 'graphql';
import { createMockClient } from 'mock-apollo-client';
import VueApollo from 'vue-apollo';
import {ComponentHarness, render} from '@testing-library/vue';
import { when } from 'jest-when';

interface QuerySpec {
  query: DocumentNode;
  successData: object;
  variables?: object;
}

export interface RenderResult extends ComponentHarness  {
  queryMocks: Array<jest.Mock<any, any>>;
}
const renderWithApollo = (
  component: VueConstructor<Vue>,
  querySpec: QuerySpec | QuerySpec[],
  options: { [id: string]: any } = {}
): RenderResult => {
  const mockApolloClient = createMockClient();
  const specs: QuerySpec[] = Array.isArray(querySpec) ? querySpec : [querySpec];

  const queryMocks = specs.map(spec => {
    const queryMock = jest.fn();
    if (spec.variables) {
      queryMock
        .mockResolvedValueOnce({
          data: spec.successData,
        });
    } else {
      queryMock.mockResolvedValueOnce({
        data: spec.successData,
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    vue => vue.use(VueApollo)
  );

  return {
    ...result,
    queryMocks,
  };
};

export * from '@testing-library/vue';
export { renderWithApollo };
