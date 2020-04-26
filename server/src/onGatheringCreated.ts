import Gatherings from './gatherings';
import InvalidPayloadError from './InvalidPayloadError';
import {ConnectionContext} from './socketServer';

export const GATHERING_CREATED = 'GATHERING_CREATED';

interface GatheringCreatedEvent {
  id: string;
}

const mapToEvent = (rawData: string) => {
  let result: GatheringCreatedEvent;
  try {
    result = JSON.parse(rawData);
  } catch(e) {
    throw new InvalidPayloadError('event payload must be valid json');
  }

  if (!result.id) {
    throw new InvalidPayloadError('new gatherings must have a valid id');
  }

  return result;
};

const onGatheringCreated = (eventPayload: string, gatherings: Gatherings, context: ConnectionContext) => {
  const parsedEvent = mapToEvent(eventPayload);

  const result = gatherings.create(parsedEvent.id);

  if (!result) {
    return;
  }
  context.sourceSocket.join(result.id);
};

export default onGatheringCreated;
