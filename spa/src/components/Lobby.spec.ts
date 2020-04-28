import {render} from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import Lobby from "@/components/Lobby.vue";

describe("<Lobby />", () => {
  it("creates a gathering when I input a valid name and continue", async () => {
    const { getByLabelText, getByText, findByText } = render(Lobby);

    await userEvent.type(getByLabelText('Your name'), 'yulu');

    userEvent.click(getByText('New gathering'));

    await expect(await findByText('In room placeholder-id')).toBeInTheDocument();
  });
});
