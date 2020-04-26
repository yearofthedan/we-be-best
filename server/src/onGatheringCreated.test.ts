import InvalidPayloadError from './InvalidPayloadError';
import onGatheringCreated from './onGatheringCreated';
import Gatherings from './gatherings';
import {Socket} from 'socket.io';
import {ConnectionContext} from './socketServer';

function createMockSocket() {
  return {
    join: jest.fn() as Socket['join']
  } as Socket;
}

describe('onGatheringCreated', () => {
  it('creates the gathering and joins the newly created group', () => {
    const context: ConnectionContext = {
      sourceSocket: createMockSocket(),
      sendToGroup: jest.fn()
    };

    onGatheringCreated(JSON.stringify({ id: 'gathering-1' }), new Gatherings(), context);

    expect(context.sourceSocket.join).toHaveBeenCalledWith('gathering-1');
  });

  it('throws a contract error if the event doesn\t have an id', () => {
    const context: ConnectionContext = {
      sourceSocket: createMockSocket(),
      sendToGroup: jest.fn()
    };

    expect(() => {
      onGatheringCreated(JSON.stringify({ id: '' }), new Gatherings(), context);
    }).toThrowError(new InvalidPayloadError('new gatherings must have a valid id'));
  });

  it('throws a contract error if the json is invalid', () => {
    const context: ConnectionContext = {
      sourceSocket: createMockSocket(),
      sendToGroup: jest.fn()
    };

    expect(() => {
      onGatheringCreated('dodgy', new Gatherings(), context);
    }).toThrowError(new InvalidPayloadError('event payload must be valid json'));
  });

  it('does nothing if the group already exists', () => {
    const context: ConnectionContext = {
      sourceSocket: createMockSocket(),
      sendToGroup: jest.fn()
    };
    const gatherings = new Gatherings();
    gatherings.create('gathering-1');

    onGatheringCreated(JSON.stringify({ id: 'gathering-1' }), gatherings, context);

    expect(context.sourceSocket.join).not.toHaveBeenCalled();
  });
});
