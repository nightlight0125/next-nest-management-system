import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { SelfCheckedDepartmentService } from '../self-checked-department/self-checked-department.service';

@Module({
  providers: [PerformanceService, PrismaService, SelfCheckedDepartmentService],
  controllers: [PerformanceController],
})
export class PerformanceModule {}
