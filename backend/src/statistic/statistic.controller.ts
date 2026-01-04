import { Controller, Get, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get('overview')
  async getOverviewStatistics(@Query() q) {
    const startDate = q.startDate || null;
    const endDate = q.endDate || null;
    return await this.statisticService.getOverviewStatistics(
      startDate,
      endDate,
    );
  }

  @Get('revenue')
  async getRevenueStatistics(@Query() q) {
    const period = q.period || 'month'; // day, week, month, year
    const startDate = q.startDate || null;
    const endDate = q.endDate || null;
    return await this.statisticService.getRevenueStatistics(
      period,
      startDate,
      endDate,
    );
  }

  @Get('orders')
  async getOrderStatistics(@Query() q) {
    const period = q.period || 'month';
    const startDate = q.startDate || null;
    const endDate = q.endDate || null;
    return await this.statisticService.getOrderStatistics(
      period,
      startDate,
      endDate,
    );
  }

  @Get('products')
  async getProductStatistics(@Query() q) {
    const limit = q.limit || 10;
    return await this.statisticService.getProductStatistics(limit);
  }

  @Get('categories')
  async getCategoryStatistics(@Query() q) {
    const startDate = q.startDate || null;
    const endDate = q.endDate || null;
    return await this.statisticService.getCategoryStatistics(
      startDate,
      endDate,
    );
  }

  @Get('users')
  async getUserStatistics(@Query() q) {
    const period = q.period || 'month';
    const startDate = q.startDate || null;
    const endDate = q.endDate || null;
    return await this.statisticService.getUserStatistics(
      period,
      startDate,
      endDate,
    );
  }
}
