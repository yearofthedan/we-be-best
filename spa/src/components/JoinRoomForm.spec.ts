import {render} from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import JoinRoomForm from './JoinRoomForm.vue';

describe('<join-room-form />', () => {
  it('shows an error message when I try to submit without a name', async () => {
    const { getByText, findByText } = render(JoinRoomForm);

    userEvent.click(getByText('New gathering'));

    await expect(await findByText('you need to add a name')).toBeInTheDocument();
  });

  it('emits a joined event when I have successfully joined with a name', async () => {
    const { getByLabelText, emitted, getByText } = render(JoinRoomForm);

    await userEvent.type(getByLabelText('Your name'), 'yulu');
    userEvent.click(getByText('New gathering'));

    expect(emitted().joined).not.toBeUndefined();
    expect(emitted().joined[0]).toEqual([{ id: 'placeholder-id'}]);
  });
});
