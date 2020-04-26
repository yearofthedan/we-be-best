import Gatherings from './gatherings';
import {ConnectionContext} from './socketServer';
import InvalidPayloadError from './InvalidPayloadError';

export const GATHERING_JOINED = 'GATHERING_JOINED';

interface GatheringJoinedEvent {
  id: string;
  name: string;
}

const mapToEvent = (rawData: string) => {
  let result: GatheringJoinedEvent;
  try {
    result = JSON.parse(rawData);
  } catch(e) {
    throw new InvalidPayloadError('event payload must be valid json');
  }

  if (!result.id) {
    throw new InvalidPayloadError('cannot join a gathering with an invalid id');
  }

  if (!result.name) {
    throw new InvalidPayloadError('cannot join a gathering with an invalid name');
  }

  return result;
};

const onGatheringJoined = (eventPayload: string, gatherings: Gatherings, context: ConnectionContext) => {
  const parsedEvent = mapToEvent(eventPayload);

  const result = gatherings.addMember(parsedEvent.id, parsedEvent.name);
  if (!result) {
    return;
  }

  context.sourceSocket.join(result.id);
  context.sendToGroup(result.id, GATHERING_JOINED, eventPayload);
};

export default onGatheringJoined;
