import {fireEvent, render, screen} from '@/testHelpers/renderer';
import AutoExpandingTextBox from '@/components/Room/Board/AutoExpandingTextBox.vue';

describe('<auto-expanding-text-box />', () => {
  it('only renders the first input value', async () => {
    const componentHarness = render(AutoExpandingTextBox, { propsData: {
        value: '1234'
      }});

    expect(screen.getByRole('textbox')).toHaveTextContent('1234');

    await componentHarness.updateProps({
      value: '5678',
    })

    expect(screen.getByRole('textbox')).toHaveTextContent('1234');
  });

  it('emits for every text change', async () => {
    const {emitted} = render(AutoExpandingTextBox, { propsData: {
        value: '1234'
      }});

    await fireEvent.input(screen.getByRole('textbox'), {
      target: { innerText: '4567' },
    });

    await fireEvent.input(screen.getByRole('textbox'), {
      target: { innerText: '4567890' },
    });

    expect(emitted().input[0]).toEqual(['4567']);
    expect(emitted().input[1]).toEqual(['4567890']);
  });
})
