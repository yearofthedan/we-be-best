import { render, screen } from '@/testHelpers/renderer';
import RoomDetails from '@/components/Room/Details/RoomDetails.vue';
import userEvent from '@testing-library/user-event';
import { buildItemViewModel, makeMember } from '@/testHelpers/testData';
import { mapToJsonString } from '@/components/Room/Details/roomExport';

jest.mock('@/components/Room/Details/roomExport');

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
        items: [],
      },
    });

    userEvent.click(screen.getByRole('button', { name: /copy room link/i }));
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
        items: [],
      },
    });

    expect(screen.getByText(/myself/i)).toBeInTheDocument();
    expect(screen.getByText(/my mum/i)).toBeInTheDocument();
  });

  it('lets me download all the data', () => {
    const items = [buildItemViewModel()];
    const members = [makeMember()];

    render(RoomDetails, {
      propsData: {
        members: members,
        roomId: 'ROOM123',
        items: items,
      },
    });

    userEvent.click(screen.getByRole('button', { name: /download data/i }));

    expect(mapToJsonString).toHaveBeenCalledWith('ROOM123', items, members);
  });
});
