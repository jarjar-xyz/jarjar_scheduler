import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import envConfig from './env.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/event.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Event } from './events/entities/event.entity';
import { TransactionSuiService } from './transaction-sui/transaction-sui.service';
import { ExecutedTxsModule } from './executed_txs/executed_txs.module';
import { ExecutedTxs } from './executed_txs/entities/executed_txs.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env`,
      load: [envConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService) => {
        return {
          type: 'postgres',
          host: configService.get('db.host'),
          port: configService.get('db.port'),
          password: configService.get('db.password'),
          username: configService.get('db.user'),
          entities: [Event, ExecutedTxs],
          database: configService.get('db.database'),
          synchronize: true,
          logging: process.env.DB_LOG === 'true',
          ssl: true,
          extra: {
            ssl: {
              rejectUnauthorized: false,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    EventsModule,
    ExecutedTxsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, TransactionSuiService],
})
export class AppModule {}
