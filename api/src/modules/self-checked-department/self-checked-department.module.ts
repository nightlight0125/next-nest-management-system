import { Module } from '@nestjs/common';
import { SelfCheckedDepartmentService } from './self-checked-department.service';
import { SelfCheckedDepartmentController } from './self-checked-department.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [SelfCheckedDepartmentService, PrismaService],
  controllers: [SelfCheckedDepartmentController],
})
export class SelfCheckedDepartmentModule {}
