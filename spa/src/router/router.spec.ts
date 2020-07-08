import App from '../components/App.vue';
import { routes } from '@/router/router';
import { render, screen } from '@/testHelpers/renderer';

describe('routes', () => {
  it('renders the home page with a pop up', () => {
    const showMock = jest.fn();

    render(App, { routes, mocks: { $toasted: { show: showMock } } });

    expect(screen.getByText('create room')).toBeInTheDocument();
    expect(showMock).toHaveBeenCalled();
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
