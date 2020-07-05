import App from '../components/App.vue';
import { routes } from '@/router/router';
import { render, screen } from '@/testHelpers/renderer';

describe('routes', () => {
  it('renders the home page by default', () => {
    // @ts-ignore
    render(App, { routes });

    expect(screen.getByText('create room')).toBeInTheDocument();
  });

  it('prefills the room field if the room id is in the query field', () => {
    // @ts-ignore
    render(App, { routes }, (vue, store, router) => {
      router.push('/?room=aaaa-bbbb');
    });

    expect(screen.getByRole('textbox', { name: /Room id/i })).toHaveValue(
      'aaaa-bbbb'
    );
  });
});
