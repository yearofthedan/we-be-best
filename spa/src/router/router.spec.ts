import App from '../components/App.vue';
import { routes } from '@/router/router';
import { render, screen } from '@/testHelpers/renderer';

describe('routes', () => {
  it('renders the home page', () => {
    render(App, { routes });

    expect(screen.getByText('create room')).toBeInTheDocument();
  });

  it('prefills the room field if the room id is in the query field', () => {
    render(
      App,
      { routes, mocks: { $toasted: { show: jest.fn() } } },
      (vue, store, router) => {
        router.push('/?room=aaaa-bbbb');
      }
    );

    expect(screen.getByRole('textbox', { name: /Room id/i })).toHaveValue(
      'aaaa-bbbb'
    );
  });
});
