import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('gen-txs')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('digest/:digest')
  findByDigest(@Param('digest') digest: string) {
    return this.eventsService.findByDigest(digest);
  }

  @Get('sender/:sender')
  findBySender(@Param('sender') sender: string) {
    return this.eventsService.findBySender(sender);
  }
}
