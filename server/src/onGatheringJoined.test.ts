import {ConnectionContext} from './socketServer';
import {Socket} from 'socket.io';
import Gatherings from './gatherings';
import onGatheringJoined, {GATHERING_JOINED} from './onGatheringJoined';
import InvalidPayloadError from './InvalidPayloadError';

function createMockSocket() {
  return {
    join: jest.fn() as Socket['join']
  } as Socket;
}

describe('onGatheringJoined', () => {
  it('joins the gathering and announces to everyone that it was joined', () => {
    const gatherings = new Gatherings();
    gatherings.create('gathering-1');

    const context: ConnectionContext = {
      sourceSocket: createMockSocket(),
      sendToGroup: jest.fn()
    };

    const eventPayload = JSON.stringify({ id: 'gathering-1', name: 'my-name' });
    onGatheringJoined(eventPayload, gatherings, context);

    expect(context.sourceSocket.join).toHaveBeenCalledWith('gathering-1');
    expect(context.sendToGroup).toHaveBeenCalledWith('gathering-1', GATHERING_JOINED, eventPayload);
  });

  it('throws a contract error if the event doesn\t have an id', () => {
    const context: ConnectionContext = {
      sourceSocket: createMockSocket(),
      sendToGroup: jest.fn()
    };

    expect(() => {
      onGatheringJoined(JSON.stringify({ id: '', name: 'my-name' }), new Gatherings(), context);
    }).toThrowError(new InvalidPayloadError('cannot join a gathering with an invalid id'));
  });

  it('throws a contract error if the event doesn\t have a name', () => {
    const context: ConnectionContext = {
      sourceSocket: createMockSocket(),
      sendToGroup: jest.fn()
    };

    expect(() => {
      onGatheringJoined(JSON.stringify({ id: 'gathering-1', name: '' }), new Gatherings(), context);
    }).toThrowError(new InvalidPayloadError('cannot join a gathering with an invalid name'));
  });

  it('throws a contract error if the json is invalid', () => {
    const context: ConnectionContext = {
      sourceSocket: createMockSocket(),
      sendToGroup: jest.fn()
    };

    expect(() => {
      onGatheringJoined('dodgy', new Gatherings(), context);
    }).toThrowError(new InvalidPayloadError('event payload must be valid json'));
  });

  it('does nothing if the member has already joined', () => {
    const context: ConnectionContext = {
      sourceSocket: createMockSocket(),
      sendToGroup: jest.fn()
    };
    const gatherings = new Gatherings();
    gatherings.create('gathering-1');
    gatherings.addMember('gathering-1', 'my-name');

    onGatheringJoined(JSON.stringify({ id: 'gathering-1', name: 'my-name' }), gatherings, context);

    expect(context.sourceSocket.join).not.toHaveBeenCalled();
    expect(context.sendToGroup).not.toHaveBeenCalled();
  });
});
