import { Module } from '@nestjs/common';
import { ExecutedTxsService } from './executed_txs.service';
import { ExecutedTxsController } from './executed_txs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../events/entities/event.entity';
import { ExecutedTxs } from './entities/executed_txs.entity';
import { TransactionSuiService } from 'src/transaction-sui/transaction-sui.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    TypeOrmModule.forFeature([ExecutedTxs]),
  ],
  controllers: [ExecutedTxsController],
  providers: [ExecutedTxsService, TransactionSuiService],
})
export class ExecutedTxsModule {}
