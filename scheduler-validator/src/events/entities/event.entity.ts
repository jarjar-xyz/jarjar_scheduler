import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'sender' })
  sender: string;

  @Column({ type: 'varchar', name: 'package_id' })
  packageId: string;

  @Column({ type: 'varchar', name: 'execution_path' })
  execution_path: string;

  @Column({ type: 'varchar', name: 'params_id' })
  params_id: string;

  @Column({ type: 'int', name: 'execution_timestamp' })
  execution_timestamp: number;

  @Column({ type: 'varchar', name: 'amount' })
  amount: string;

  @Column({ type: 'varchar', name: 'event_seq' })
  eventSeq: string;

  @Column({ type: 'varchar', name: 'digest' })
  digest: string;

  @Column({ type: 'boolean', name: 'executed', default: false })
  executed: boolean;

  @Column({ type: 'jsonb', name: 'error', nullable: true })
  error: any;

  // Removed fields that are not in the DTO
  // transaction_digest, issuer_package, issuer_module, prompt_data, callback_data,
  // timestampMs, model_name, price, retries
}
