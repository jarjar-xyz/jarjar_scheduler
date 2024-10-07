import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ExecutedTxsService } from './executed_txs.service';

@Controller('executed-txs')
export class ExecutedTxsController {
  constructor(private readonly executedTxsService: ExecutedTxsService) {}

  @Get()
  async getAll() {
    return await this.executedTxsService.getAll();
  }

  @Get('digest/:digest')
  async getByDigest(@Param('digest') digest: string) {
    return await this.executedTxsService.getByDigest(digest);
  }

  @Get('latest/:packageId')
  async getLatestByPackageId(@Param('packageId') packageId: string) {
    return await this.executedTxsService.getLatestByPackageId(packageId);
  }

  @Get('count')
  async getCount() {
    return await this.executedTxsService.getCount();
  }
}
