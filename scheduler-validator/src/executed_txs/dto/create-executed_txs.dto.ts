import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateExecutedTxsDto {
  @IsString()
  @IsNotEmpty()
  sender: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  packageId: string;

  @IsString()
  @IsNotEmpty()
  execution_path: string;

  @IsString()
  @IsNotEmpty()
  params_id: string;

  @IsNumber()
  @IsNotEmpty()
  executed_timestamp: number;

  @IsString()
  @IsNotEmpty()
  cost: string;

  @IsString()
  @IsNotEmpty()
  reward: string;

  @IsString()
  @IsNotEmpty()
  rewardType: string;

  @IsString()
  @IsNotEmpty()
  digest: string;

  @IsString()
  @IsNotEmpty()
  eventSeq: string;

  @IsBoolean()
  executed: boolean;

  error: any;
}
