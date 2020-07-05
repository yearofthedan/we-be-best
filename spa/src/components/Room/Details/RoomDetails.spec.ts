import { render, screen } from '@/testHelpers/renderer';
import RoomDetails from '@/components/Room/Details/RoomDetails.vue';
import userEvent from '@testing-library/user-event';

describe('RoomDetails', () => {
  it('shows the room id and lets me copy it', () => {
    // @ts-ignore
    const clipboard = (global.navigator.clipboard = { writeText: jest.fn() });

    render(RoomDetails, {
      propsData: {
        members: [
          { id: '1234', name: 'me' },
          { id: '5678', name: 'my mum' },
        ],
        roomId: 'ROOM123',
      },
    });

    userEvent.click(
      screen.getByRole('button', { name: /copy room to clipboard/i })
    );
    expect(clipboard.writeText).toHaveBeenCalledWith('localhost/?room=ROOM123');
  });

  it('shows all of the room members', () => {
    render(RoomDetails, {
      propsData: {
        members: [
          { id: '1234', name: 'myself' },
          { id: '5678', name: 'my mum' },
        ],
        roomId: 'ROOM123',
      },
    });

    expect(screen.getByText(/myself/i)).toBeInTheDocument();
    expect(screen.getByText(/my mum/i)).toBeInTheDocument();
  });
});
