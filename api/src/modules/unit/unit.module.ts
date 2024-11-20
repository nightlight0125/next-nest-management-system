import { Module } from '@nestjs/common';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [UnitService, PrismaService],
  controllers: [UnitController],
})
export class UnitModule {}
