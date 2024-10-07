import { Test, TestingModule } from '@nestjs/testing';
import { ExecutedTxsController } from './executed_txs.controller';
import { ExecutedTxsService } from './executed_txs.service';

describe('ExecutedTxsController', () => {
  let controller: ExecutedTxsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExecutedTxsController],
      providers: [ExecutedTxsService],
    }).compile();

    controller = module.get<ExecutedTxsController>(ExecutedTxsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
