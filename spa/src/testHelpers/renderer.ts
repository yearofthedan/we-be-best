import {VueConstructor} from 'vue';
import {DocumentNode} from 'graphql';
import {createMockClient} from 'mock-apollo-client';
import VueApollo from 'vue-apollo';
import { render } from '@testing-library/vue';
import {when} from 'jest-when';

const renderWithApollo = (
  component: VueConstructor<Vue>,
  querySpec: { query: DocumentNode, successData: object, variables?: object },
  options: { [id: string]: any } = {}
) => {
  const mockApolloClient = createMockClient();
  const queryMock = jest.fn();

  if (querySpec.variables) {
    when(queryMock)
      .calledWith(querySpec.variables)
      .mockResolvedValue({
        data: querySpec.successData
      });
  } else {
    queryMock.mockResolvedValue({
      data: querySpec.successData
    })
  }

  mockApolloClient.setRequestHandler(querySpec.query, queryMock)

  const apolloProvider = new VueApollo({
    defaultClient: mockApolloClient,
  });

  const result = render(
    component,
    {
      ...options,
      apolloProvider
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    vue => vue.use(VueApollo)
  )

  return {
    ...result,
    queryMock
  }
}

export * from '@testing-library/vue';
export {
  renderWithApollo
}

