import { Test, TestingModule } from '@nestjs/testing';
import { ExecutedTxsService } from './executed_txs.service';

describe('ExecutedTxsService', () => {
  let service: ExecutedTxsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutedTxsService],
    }).compile();

    service = module.get<ExecutedTxsService>(ExecutedTxsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
