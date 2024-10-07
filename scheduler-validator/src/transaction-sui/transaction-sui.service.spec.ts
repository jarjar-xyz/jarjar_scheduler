import { Test, TestingModule } from '@nestjs/testing';
import { TransactionSuiService } from './transaction-sui.service';

describe('TransactionSuiService', () => {
  let service: TransactionSuiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionSuiService],
    }).compile();

    service = module.get<TransactionSuiService>(TransactionSuiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
