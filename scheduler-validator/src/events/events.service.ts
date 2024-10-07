import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { fetchEvents } from './fetchEvents.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';
import {
  getFullnodeUrl,
  SuiClient,
  SuiHTTPTransport,
} from '@mysten/sui/client';

@Injectable()
export class EventsService {
  suiClient: SuiClient;

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {
    this.suiClient = new SuiClient({
      transport: new SuiHTTPTransport({
        url: getFullnodeUrl(process.env.SUI_NETWORK as 'mainnet' | 'testnet'),
      }),
    });
  }

  @Cron(CronExpression.EVERY_SECOND)
  async fetchFromSui() {
    const lastTx = await this.eventRepository.findOne({
      order: { id: 'DESC' },
      where: {},
    });
    let lastCursor = undefined; // fetch from 0 if undefined
    if (lastTx)
      lastCursor = {
        txDigest: lastTx.digest,
        eventSeq: lastTx.eventSeq,
      };

    const sui_events = await fetchEvents(lastCursor, this.suiClient);

    if (!sui_events) return;

    try {
      const event = await this.eventRepository.create(sui_events);
      await this.eventRepository.save(event);
    } catch (err) {
      console.log(err);
    }
  }

  async findAll() {
    return await this.eventRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findByDigest(digest: string) {
    return await this.eventRepository.findOne({
      where: { digest },
    });
  }

  async findBySender(sender: string) {
    return await this.eventRepository.find({
      where: { sender },
    });
  }
}
