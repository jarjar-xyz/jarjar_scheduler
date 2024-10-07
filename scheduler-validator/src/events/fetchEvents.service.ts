import { EventId, SuiClient } from '@mysten/sui/client';
import { CreateEventDto } from './dto/create-event.dto';
import { validate } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';

const configService = new ConfigService();

const queryEvents = async (
  lastCursor: EventId | undefined,
  client: SuiClient,
) => {
  console.log(
    process.env.EVENT_PACKAGE_ID,
    process.env.EVENT_MODULE_NAME,
    dayjs().toString(),
    dayjs().unix(),
  );
  const { data } = await client.queryEvents({
    query: {
      MoveEventModule: {
        package: process.env.EVENT_PACKAGE_ID,
        module: process.env.EVENT_MODULE_NAME,
      },
    },
    cursor: lastCursor ?? undefined,
    order: 'ascending',
    limit: 50,
  });
  data.length ? console.log(data) : null;
  return data;
};

const parseEvents = (events: any[]) => {
  const eventsFormated = [];

  for (const event of events) {
    const eventFormated = new CreateEventDto();
    eventFormated.sender = event.sender;
    eventFormated.digest = event.id.txDigest;
    eventFormated.packageId = event.packageId;
    eventFormated.execution_path = event.parsedJson.execution_path;
    eventFormated.params_id = event.parsedJson.params_id;
    eventFormated.execution_timestamp = Number(
      BigInt(event.parsedJson.execution_time) / BigInt(1000), // Convert to seconds
    );
    eventFormated.amount = event.parsedJson.amount;
    eventFormated.eventSeq = event.id.eventSeq;
    eventFormated.executed = false;
    eventsFormated.push(eventFormated);
  }

  return eventsFormated;
};

const validateEvents = async (events: CreateEventDto[]) => {
  for (const event of events) {
    const validation = await validate(event);

    let formatedErrors: any = [];

    for (const error of validation) {
      formatedErrors.push({
        value: error.value,
        constraints: error.constraints,
        property: error.property,
      });
    }

    formatedErrors = formatedErrors.length ? formatedErrors : null;
    event.error = formatedErrors;
  }
};

export const fetchEvents = async (
  lastCursor: EventId | undefined,
  client: SuiClient,
) => {
  try {
    const events = await queryEvents(lastCursor, client);
    if (events.length === 0) {
      return null;
    }

    const parsedEvents = parseEvents(events);
    await validateEvents(parsedEvents);
    return parsedEvents;
  } catch (err) {
    console.error(err);
    return null;
  }
};
