import ButtonContained from '@/components/atoms/ButtonContained.vue';
import { render, screen } from '@/testHelpers/renderer';
import { ACTION_STATE } from '@/components/atoms/buttonStates';
import userEvent from '@testing-library/user-event';

describe('ButtonContained', () => {
  it('adds a data-attr for loading when loading', () => {
    render(ButtonContained, {
      propsData: {
        state: ACTION_STATE.LOADING,
      },
    });

    expect(screen.getByRole('button')).toHaveAttribute(
      'data-action-state',
      ACTION_STATE.LOADING
    );
  });

  it('adds a data-attr for success when successfully loaded', () => {
    render(ButtonContained, {
      propsData: {
        state: ACTION_STATE.SUCCESS,
      },
    });

    expect(screen.getByRole('button')).toHaveAttribute(
      'data-action-state',
      ACTION_STATE.SUCCESS
    );
  });

  it('emits the click event when clicked', () => {
    const { emitted } = render(ButtonContained, {
      propsData: {
        state: ACTION_STATE.READY,
      },
    });

    userEvent.click(screen.getByRole('button'));

    expect(emitted().click[0][0]).toBeDefined();
  });

  it('disables the button while it is loading', () => {
    render(ButtonContained, {
      propsData: {
        state: ACTION_STATE.LOADING,
      },
    });

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables the button once it is successful', () => {
    render(ButtonContained, {
      propsData: {
        state: ACTION_STATE.SUCCESS,
      },
    });

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
