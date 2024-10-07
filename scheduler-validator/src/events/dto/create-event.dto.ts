import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  sender: string;

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
  execution_timestamp: number;

  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  eventSeq: string;

  @IsString()
  @IsNotEmpty()
  digest: string;

  executed: boolean;

  error: any;
}
