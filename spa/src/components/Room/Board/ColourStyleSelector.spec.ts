import ColourStyleSelector from '@/components/Room/Board/ColourStyleSelector.vue';
import { render, screen } from '@/testHelpers/renderer';
import userEvent from '@testing-library/user-event';
import { itemTheme } from '@/components/Room/Board/itemTheme';

describe('ColourStyleSelector', () => {
  it('lets me select an option', async () => {
    const { emitted } = render(ColourStyleSelector, {
      propsData: { options: itemTheme },
    });

    await userEvent.click(screen.getByRole('radio', { name: /style-1/i }));

    expect(emitted().input[0]).toEqual(['style-1']);
  });

  it('renders all the provided options', async () => {
    render(ColourStyleSelector, { propsData: { options: itemTheme } });

    const result = await screen.getAllByRole('radio');

    expect(result).toHaveLength(itemTheme.length);
  });
});
