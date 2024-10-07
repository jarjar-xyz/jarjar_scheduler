import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ExecutedTxs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'sender' })
  sender: string;

  @Column({ type: 'varchar', name: 'status' })
  status: string;

  @Column({ type: 'varchar', name: 'package_id' })
  packageId: string;

  @Column({ type: 'varchar', name: 'execution_path' })
  execution_path: string;

  @Column({ type: 'varchar', name: 'params_id' })
  params_id: string;

  @Column({ type: 'int', name: 'executed_timestamp' })
  executed_timestamp: number;

  @Column({ type: 'varchar', name: 'cost', nullable: true })
  cost: string;

  @Column({ type: 'varchar', name: 'reward', nullable: true })
  reward: string;

  @Column({ type: 'varchar', name: 'reward_type', nullable: true })
  rewardType: string;

  @Column({ type: 'varchar', name: 'digest', unique: true, nullable: true })
  digest: string;

  @Column({ type: 'varchar', name: 'event_seq', nullable: true })
  eventSeq: string;

  @Column({ type: 'boolean', name: 'executed', default: false })
  executed: boolean;

  @Column({ type: 'jsonb', name: 'error', nullable: true, default: null })
  error: any;
}
