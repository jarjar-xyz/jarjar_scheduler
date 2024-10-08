import { ExecutedTxs } from './entities/executed_txs.entity';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { TransactionSuiService } from 'src/transaction-sui/transaction-sui.service';
import dayjs from 'dayjs';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

@Injectable()
export class ExecutedTxsService {
  isExecuting = false;
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(ExecutedTxs)
    private readonly executedTxsRepository: Repository<ExecutedTxs>,
    private readonly transactionSuiService: TransactionSuiService,
  ) {}

  async fetch_event_to_execute() {
    const currentTimestamp = dayjs().unix();
    const event = await this.eventRepository.findOne({
      order: { id: 'ASC' },
      where: [
        { executed: false, execution_timestamp: LessThan(currentTimestamp) },
      ],
    });
    return event;
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async execute_queue() {
    if (this.isExecuting) {
      console.log('isGenerating true', dayjs().toString());
      return;
    }
    this.isExecuting = true;

    const eventToExec = await this.fetch_event_to_execute();
    if (!eventToExec) {
      this.isExecuting = false;
      return;
    }
    console.log('eventToExec', eventToExec);
    const tx = await this.buildRunDryTx(eventToExec);

    try {
      console.log('SUI_NETWORK', process.env.SUI_NETWORK);
      const client = new SuiClient({
        url: getFullnodeUrl(process.env.SUI_NETWORK as 'mainnet' | 'testnet'),
      });

      tx.setSender(
        this.transactionSuiService.keyPair.getPublicKey().toSuiAddress(),
      );
      const txBCS = await tx.build({ client: client });
      const result = await this.transactionSuiService.runDryRun(txBCS);
      const isProfitable = await this.checkDryRunResult(result);
      console.log('isProfitable', isProfitable);
      if (isProfitable) {
        const digest =
          await this.transactionSuiService.sendCallbackTx(eventToExec);
        await this.submitExecutedTxToDb(
          { ...eventToExec, digest: digest },
          this.parseTxResult(result),
        );
        console.log('callback digest', digest);
      } else {
        throw new Error('Not profitable');
      }
    } catch (error) {
      console.error('Error running dry run:', error);
      await this.submitExecutedTxToDb(eventToExec, {
        status: 'error',
        error: error.message,
      });
    }

    this.isExecuting = false;
  }

  parseTxResult(result: any) {
    const balanceChanges = result.balanceChanges;
    const binksBalance = balanceChanges.find(
      (item: any) => item.coinType === process.env.BINKS_COIN_TYPE,
    );
    const binksBalanceInt = parseInt(binksBalance.amount);
    const suiBalanceInt = parseInt(
      balanceChanges.find((item: any) => item.coinType === '0x2::sui::SUI')
        .amount,
    );

    const cost = Math.ceil(
      suiBalanceInt * parseFloat(process.env.SUI_TO_BINKS_RATIO as string) * -1,
    );
    const reward = binksBalanceInt;
    return {
      status: result.effects.status.status,
      cost: suiBalanceInt,
      reward: reward,
      rewardType: process.env.BINKS_COIN_TYPE,
      digest: result.digest,
      error: result.effects.status.error,
    };
  }

  checkDryRunResult(result: any) {
    if (result.effects.status.status !== 'success') {
      throw new Error(
        'Dry run failed status: ' +
          result.effects.status.status +
          ' error: ' +
          result.effects.status.error,
      );
    }

    const balanceChanges = result.balanceChanges;
    const binksBalance = balanceChanges.find(
      (item: any) => item.coinType === process.env.BINKS_COIN_TYPE,
    );
    const binksBalanceInt = parseInt(binksBalance.amount);
    const suiBalanceInt = parseInt(
      balanceChanges.find((item: any) => item.coinType === '0x2::sui::SUI')
        .amount,
    );

    const cost = Math.ceil(
      suiBalanceInt * parseFloat(process.env.SUI_TO_BINKS_RATIO as string) * -1,
    );
    const reward = binksBalanceInt;

    console.log('cost', cost);
    console.log('reward', reward);

    if (cost < reward) {
      return true;
    }
    return false;
  }

  async buildRunDryTx(event: Event) {
    const tx = new Transaction();
    console.log('TARGET', `${event.packageId}::${event.execution_path}`);
    console.log('PARAMS_ID', event.params_id);
    console.log('SUI_CLOCK_OBJECT_ID', SUI_CLOCK_OBJECT_ID);

    tx.moveCall({
      target: `${event.packageId}::${event.execution_path}`,
      arguments: [tx.object(event.params_id), tx.object(SUI_CLOCK_OBJECT_ID)],
    });
    tx.setGasBudget(100000000);
    return tx;
  }

  async submitRealTxToBlockchain(event: Event) {
    const MAX_RETRIES = 1;
    const RETRY_DELAY = 1000; // 1 second

    for (let retries = 0; retries < MAX_RETRIES; retries++) {
      console.error(
        `submitRealTxToBlockchain (attempt ${retries + 1}/${MAX_RETRIES}):`,
      );
      try {
        const digest = await this.transactionSuiService.sendCallbackTx(event);
        console.log('digest', digest);
        return digest;
      } catch (error) {
        console.error(
          `Error submitResultToBlockchain (attempt ${retries + 1}/${MAX_RETRIES}):`,
          error.message,
        );

        if (retries === MAX_RETRIES - 1) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  async submitExecutedTxToDb(event: Event, parsedResult: any) {
    await this.eventRepository.update(
      { id: event.id },
      {
        executed: true,
      },
    );

    const executedTx = await this.executedTxsRepository.create({
      sender: event.sender,
      status: parsedResult.status,
      packageId: event.packageId,
      execution_path: event.execution_path,
      params_id: event.params_id,
      executed_timestamp: dayjs().unix(),
      cost: parsedResult.cost,
      reward: parsedResult.reward,
      rewardType: parsedResult.rewardType,
      digest: event.digest,
      error: parsedResult.error,
    });
    await this.executedTxsRepository.save(executedTx);
  }

  async getAll() {
    return await this.executedTxsRepository.find({
      order: { id: 'DESC' },
      take: 50,
    });
  }

  async getByDigest(digest: string) {
    return await this.executedTxsRepository.findOne({
      where: { digest: digest },
    });
  }

  async getLatestByPackageId(packageId: string) {
    return await this.executedTxsRepository.find({
      where: { packageId: packageId },
      order: { id: 'DESC' },
    });
  }

  async getCount() {
    return await this.executedTxsRepository.count();
  }
}
