import { render, screen } from '@/testHelpers/renderer';
import RoomDetails from '@/components/Room/Details/RoomDetails.vue';

describe('RoomDetails', () => {
  it('shows all of the room members', () => {
    render(RoomDetails, {
      propsData: {
        members: [
          { id: '1234', name: 'myself' },
          { id: '5678', name: 'my mum' },
        ],
        roomId: 'ROOM123',
        items: [],
      },
    });

    expect(screen.getByText(/myself/i)).toBeInTheDocument();
    expect(screen.getByText(/my mum/i)).toBeInTheDocument();
  });
});
