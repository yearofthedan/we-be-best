import ColourStyleSelector from '@/components/Room/Board/ColourStyleSelector.vue';
import { render, screen } from '@/testHelpers/renderer';
import userEvent from '@testing-library/user-event';
import { noteTheme } from '@/components/Room/Board/noteTheme';

describe('ColourStyleSelector', () => {
  it('lets me select an option', async () => {
    const { emitted } = render(ColourStyleSelector, {
      propsData: { options: noteTheme },
    });

    await userEvent.click(screen.getByRole('radio', { name: /style-1/i }));

    expect(emitted().input[0]).toEqual(['style-1']);
  });

  it('renders all the provided options', async () => {
    render(ColourStyleSelector, { propsData: { options: noteTheme } });

    const result = await screen.getAllByRole('radio');

    expect(result).toHaveLength(noteTheme.length);
  });
});
