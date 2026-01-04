import { Module } from '@nestjs/common';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [StatisticController],
  providers: [StatisticService],
  imports: [DatabaseModule],
})
export class StatisticModule {}
