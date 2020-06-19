import ColourStyleSelector from '@/components/Room/Board/ColourStyleSelector.vue';
import { render, screen } from '@/testHelpers/renderer';
import userEvent from '@testing-library/user-event';
import {
  BLACKEST_BLACK,
  GOLD_LEAF,
  LIGHT_CYAN,
  LIGHT_ORANGE,
  LIGHT_PINK,
  WHITEST_WHITE,
} from '@/components/Room/Board/itemBuilder';

describe('ColourStyleSelector', () => {
  it('lets me select style one', async () => {
    const { emitted } = render(ColourStyleSelector);

    await userEvent.click(screen.getByRole('radio', { name: /style-1/i }));

    expect(emitted().input[0]).toEqual([
      {
        backgroundColour: LIGHT_CYAN,
        textColour: BLACKEST_BLACK,
      },
    ]);
  });

  it('lets me select style two', async () => {
    const { emitted } = render(ColourStyleSelector);

    await userEvent.click(screen.getByRole('radio', { name: /style-2/i }));

    expect(emitted().input[0]).toEqual([
      {
        backgroundColour: LIGHT_PINK,
        textColour: BLACKEST_BLACK,
      },
    ]);
  });

  it('lets me select style three', async () => {
    const { emitted } = render(ColourStyleSelector);

    await userEvent.click(screen.getByRole('radio', { name: /style-3/i }));

    expect(emitted().input[0]).toEqual([
      {
        backgroundColour: LIGHT_ORANGE,
        textColour: BLACKEST_BLACK,
      },
    ]);
  });

  it('lets me select style four', async () => {
    const { emitted } = render(ColourStyleSelector);

    await userEvent.click(screen.getByRole('radio', { name: /style-4/i }));

    expect(emitted().input[0]).toEqual([
      {
        backgroundColour: WHITEST_WHITE,
        textColour: BLACKEST_BLACK,
      },
    ]);
  });

  it('lets me select style five', async () => {
    const { emitted } = render(ColourStyleSelector);

    await userEvent.click(screen.getByRole('radio', { name: /style-5/i }));

    expect(emitted().input[0]).toEqual([
      {
        backgroundColour: BLACKEST_BLACK,
        textColour: GOLD_LEAF,
      },
    ]);
  });
});
